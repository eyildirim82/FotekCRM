import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Order, OrderStatus } from '../entities/order.entity'
import { OrderLine } from '../entities/order-line.entity'
import { StockTransaction, TransactionType, TransactionReason } from '../entities/stock-transaction.entity'
import { Product } from '../entities/product.entity'
import { ProductVariant } from '../entities/variant.entity'
import { Company } from '../entities/company.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLine)
    private readonly orderLineRepository: Repository<OrderLine>,
    @InjectRepository(StockTransaction)
    private readonly stockTransactionRepository: Repository<StockTransaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  // Create order with stock deduction
  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Validate customer exists
      const customer = await this.companyRepository.findOne({
        where: { id: createOrderDto.customerId, isActive: true }
      })
      
      if (!customer) {
        throw new NotFoundException('Müşteri bulunamadı')
      }

      // Validate stock availability for all items
      await this.validateStockAvailability(createOrderDto.orderLines)

      // Create order
      const order = this.orderRepository.create({
        ...createOrderDto,
        createdById: userId,
        status: createOrderDto.status || OrderStatus.DRAFT
      })

      const savedOrder = await queryRunner.manager.save(order)

      // Create order lines and process stock
      for (const lineDto of createOrderDto.orderLines) {
        // Create order line
        const orderLine = this.orderLineRepository.create({
          ...lineDto,
          orderId: savedOrder.id
        })
        
        await queryRunner.manager.save(orderLine)

        // Process stock deduction if order is confirmed
        if (savedOrder.status === OrderStatus.CONFIRMED) {
          await this.processStockDeduction(lineDto, savedOrder, userId, queryRunner.manager)
        }
      }

      // Calculate and update order totals
      const orderWithLines = await queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['orderLines']
      })

      orderWithLines.calculateTotals()
      await queryRunner.manager.save(orderWithLines)

      await queryRunner.commitTransaction()

      // Return complete order with relations
      return this.findOne(savedOrder.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Get all orders with pagination
  async findAll(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    customerId?: string
    startDate?: string
    endDate?: string
  }) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      customerId,
      startDate,
      endDate
    } = params || {}

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.product', 'product')
      .leftJoinAndSelect('orderLines.variant', 'variant')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
      .where('order.isActive = :isActive', { isActive: true })

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber LIKE :search OR customer.name LIKE :search OR order.notes LIKE :search)',
        { search: `%${search}%` }
      )
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status })
    }

    // Customer filter
    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId })
    }

    // Date range filter
    if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate })
    }
    if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate })
    }

    // Pagination
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    // Order by creation date (newest first)
    queryBuilder.orderBy('order.createdAt', 'DESC')

    const [orders, total] = await queryBuilder.getManyAndCount()
    const totalPages = Math.ceil(total / limit)

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  }

  // Get single order
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'customer',
        'orderLines',
        'orderLines.product',
        'orderLines.variant',
        'stockTransactions',
        'createdBy',
        'updatedBy'
      ]
    })

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı')
    }

    return order
  }

  // Update order
  async update(id: number, updateOrderDto: UpdateOrderDto, userId: string): Promise<Order> {
    const order = await this.findOne(id)

    // Check if order is editable
    if (!order.isEditable && updateOrderDto.status !== order.status) {
      // Allow only status changes for non-editable orders
      const allowedUpdates = ['status', 'shippedDate', 'deliveryDate', 'notes', 'internalNotes']
      const hasOtherUpdates = Object.keys(updateOrderDto).some(key => 
        !allowedUpdates.includes(key) && updateOrderDto[key] !== undefined
      )
      
      if (hasOtherUpdates) {
        throw new BadRequestException('Bu sipariş düzenlenemez, sadece durum güncellemesi yapılabilir')
      }
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Handle status change to confirmed (process stock deduction)
      if (updateOrderDto.status === OrderStatus.CONFIRMED && order.status === OrderStatus.DRAFT) {
        for (const orderLine of order.orderLines) {
          await this.processStockDeduction(orderLine, order, userId, queryRunner.manager)
        }
      }

      // Handle status change from confirmed to draft (reverse stock deduction)
      if (updateOrderDto.status === OrderStatus.DRAFT && order.status === OrderStatus.CONFIRMED) {
        await this.reverseStockDeduction(order, userId, queryRunner.manager)
      }

      // Update order
      Object.assign(order, updateOrderDto)
      order.updatedById = userId

      await queryRunner.manager.save(order)
      await queryRunner.commitTransaction()

      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Soft delete order
  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const order = await this.findOne(id)

    if (order.status === OrderStatus.CONFIRMED) {
      throw new BadRequestException('Onaylanmış sipariş silinemez, önce iptal edilmelidir')
    }

    await this.orderRepository.softDelete(id)

    return {
      success: true,
      message: 'Sipariş başarıyla silindi'
    }
  }

  // Get order statistics
  async getStats(params?: { customerId?: string; startDate?: string; endDate?: string }) {
    const { customerId, startDate, endDate } = params || {}

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.isActive = :isActive', { isActive: true })

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId })
    }

    if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate })
    }

    const [
      totalOrders,
      draftOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.DRAFT }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.CONFIRMED }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.SHIPPED }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.DELIVERED }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.CANCELLED }).getCount(),
    ])

    // Calculate revenue (only delivered orders)
    const revenueResult = await queryBuilder
      .clone()
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne()

    const totalRevenue = parseFloat(revenueResult?.totalRevenue || '0')

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      draftOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue
    }
  }

  // Private helper methods
  private async validateStockAvailability(orderLines: any[]): Promise<void> {
    for (const line of orderLines) {
      if (line.productId) {
        const product = await this.productRepository.findOne({
          where: { id: line.productId, isActive: true }
        })
        
        if (!product) {
          throw new NotFoundException(`Ürün bulunamadı: ${line.itemCode}`)
        }

        if (product.stockQuantity < line.quantity) {
          throw new BadRequestException(
            `Yetersiz stok: ${line.itemName} (Mevcut: ${product.stockQuantity}, İstenen: ${line.quantity})`
          )
        }
      }

      if (line.variantId) {
        const variant = await this.variantRepository.findOne({
          where: { id: line.variantId, isActive: true }
        })
        
        if (!variant) {
          throw new NotFoundException(`Varyant bulunamadı: ${line.itemCode}`)
        }

        if (variant.stockQuantity < line.quantity) {
          throw new BadRequestException(
            `Yetersiz varyant stoku: ${line.itemName} (Mevcut: ${variant.stockQuantity}, İstenen: ${line.quantity})`
          )
        }
      }
    }
  }

  private async processStockDeduction(orderLine: any, order: Order, userId: string, manager: any): Promise<void> {
    if (orderLine.productId) {
      const product = await manager.findOne(Product, { where: { id: orderLine.productId } })
      const previousStock = product.stockQuantity
      const newStock = previousStock - orderLine.quantity

      // Update product stock
      await manager.update(Product, orderLine.productId, { stockQuantity: newStock })

      // Create stock transaction
      const stockTransaction = this.stockTransactionRepository.create({
        productId: orderLine.productId,
        orderId: order.id,
        transactionType: TransactionType.OUT,
        reason: TransactionReason.ORDER,
        quantity: orderLine.quantity,
        previousStock,
        newStock,
        unitCost: orderLine.unitPrice,
        totalCost: orderLine.totalPrice,
        currency: orderLine.currency || 'TRY',
        referenceNumber: order.orderNumber,
        description: `Sipariş çıkışı: ${order.orderNumber}`,
        createdById: userId
      })

      await manager.save(stockTransaction)
    }

    if (orderLine.variantId) {
      const variant = await manager.findOne(ProductVariant, { where: { id: orderLine.variantId } })
      const previousStock = variant.stockQuantity
      const newStock = previousStock - orderLine.quantity

      // Update variant stock
      await manager.update(ProductVariant, orderLine.variantId, { stockQuantity: newStock })

      // Create stock transaction
      const stockTransaction = this.stockTransactionRepository.create({
        variantId: orderLine.variantId,
        orderId: order.id,
        transactionType: TransactionType.OUT,
        reason: TransactionReason.ORDER,
        quantity: orderLine.quantity,
        previousStock,
        newStock,
        unitCost: orderLine.unitPrice,
        totalCost: orderLine.totalPrice,
        currency: orderLine.currency || 'TRY',
        referenceNumber: order.orderNumber,
        description: `Sipariş çıkışı: ${order.orderNumber}`,
        createdById: userId
      })

      await manager.save(stockTransaction)
    }
  }

  private async reverseStockDeduction(order: Order, userId: string, manager: any): Promise<void> {
    // Find stock transactions for this order
    const stockTransactions = await manager.find(StockTransaction, {
      where: { orderId: order.id, transactionType: TransactionType.OUT }
    })

    for (const transaction of stockTransactions) {
      if (transaction.productId) {
        const product = await manager.findOne(Product, { where: { id: transaction.productId } })
        const previousStock = product.stockQuantity
        const newStock = previousStock + transaction.quantity

        // Restore product stock
        await manager.update(Product, transaction.productId, { stockQuantity: newStock })

        // Create reverse stock transaction
        const reverseTransaction = this.stockTransactionRepository.create({
          productId: transaction.productId,
          orderId: order.id,
          transactionType: TransactionType.IN,
          reason: TransactionReason.RETURN,
          quantity: transaction.quantity,
          previousStock,
          newStock,
          referenceNumber: order.orderNumber,
          description: `Sipariş iptali stok iadesi: ${order.orderNumber}`,
          createdById: userId
        })

        await manager.save(reverseTransaction)
      }

      if (transaction.variantId) {
        const variant = await manager.findOne(ProductVariant, { where: { id: transaction.variantId } })
        const previousStock = variant.stockQuantity
        const newStock = previousStock + transaction.quantity

        // Restore variant stock
        await manager.update(ProductVariant, transaction.variantId, { stockQuantity: newStock })

        // Create reverse stock transaction
        const reverseTransaction = this.stockTransactionRepository.create({
          variantId: transaction.variantId,
          orderId: order.id,
          transactionType: TransactionType.IN,
          reason: TransactionReason.RETURN,
          quantity: transaction.quantity,
          previousStock,
          newStock,
          referenceNumber: order.orderNumber,
          description: `Sipariş iptali stok iadesi: ${order.orderNumber}`,
          createdById: userId
        })

        await manager.save(reverseTransaction)
      }
    }
  }
} 