import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Product } from './product.entity'
import { ProductVariant } from './variant.entity'
import { Order } from './order.entity'

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

export enum TransactionReason {
  INITIAL_STOCK = 'initial_stock',
  PURCHASE = 'purchase',
  SALE = 'sale',
  ORDER = 'order',
  RETURN = 'return',
  DAMAGE = 'damage',
  LOSS = 'loss',
  FOUND = 'found',
  ADJUSTMENT = 'adjustment',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  MANUAL = 'manual'
}

@Entity('stock_transactions')
export class StockTransaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int', nullable: true })
  productId: number

  @Column({ type: 'int', nullable: true })
  variantId: number

  @Column({ type: 'int', nullable: true })
  orderId: number

  @Column({ 
    type: 'varchar', 
    length: 20,
    enum: TransactionType
  })
  transactionType: string

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: TransactionReason
  })
  reason: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number

  @Column({ type: 'varchar', length: 20, default: 'adet' })
  unit: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousStock: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newStock: number

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  unitCost: number

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  totalCost: number

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  locationFrom: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  locationTo: string

  // Relations
  @ManyToOne(() => Product, product => product.id, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product

  @ManyToOne(() => ProductVariant, variant => variant.id, { nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant

  @ManyToOne(() => Order, order => order.id, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order

  // Audit fields
  @Column({ type: 'uniqueidentifier' })
  createdById: string

  @ManyToOne(() => User, user => user.id, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date

  // Helper methods
  get itemInfo(): string {
    if (this.variant) {
      let variantInfo = []
      if (this.variant.color) variantInfo.push(this.variant.color)
      if (this.variant.size) variantInfo.push(this.variant.size)
      if (this.variant.material) variantInfo.push(this.variant.material)
      
      return variantInfo.length > 0 
        ? `${this.product?.name || 'Ürün'} (${variantInfo.join(', ')})`
        : this.product?.name || 'Ürün'
    }
    return this.product?.name || 'Ürün'
  }

  get stockChange(): number {
    return this.newStock - this.previousStock
  }

  get isStockIncrease(): boolean {
    return this.transactionType === TransactionType.IN || this.stockChange > 0
  }

  get isStockDecrease(): boolean {
    return this.transactionType === TransactionType.OUT || this.stockChange < 0
  }

  get formattedQuantity(): string {
    return `${this.quantity} ${this.unit}`
  }

  get reasonText(): string {
    const reasonTexts = {
      initial_stock: 'Başlangıç Stoku',
      purchase: 'Satın Alma',
      sale: 'Satış',
      order: 'Sipariş',
      return: 'İade',
      damage: 'Hasar',
      loss: 'Kayıp',
      found: 'Bulunan',
      adjustment: 'Düzeltme',
      transfer_in: 'Transfer Gelen',
      transfer_out: 'Transfer Giden',
      manual: 'Manuel'
    }
    return reasonTexts[this.reason] || this.reason
  }

  get typeText(): string {
    const typeTexts = {
      IN: 'Giriş',
      OUT: 'Çıkış',
      ADJUSTMENT: 'Düzeltme',
      TRANSFER: 'Transfer'
    }
    return typeTexts[this.transactionType] || this.transactionType
  }

  get typeColor(): string {
    const typeColors = {
      IN: 'success',
      OUT: 'error',
      ADJUSTMENT: 'warning',
      TRANSFER: 'processing'
    }
    return typeColors[this.transactionType] || 'default'
  }
} 