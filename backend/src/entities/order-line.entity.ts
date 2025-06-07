import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'
import { Order } from './order.entity'
import { Product } from './product.entity'
import { ProductVariant } from './variant.entity'

@Entity('order_lines')
export class OrderLine {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  orderId: number

  @Column({ type: 'int', nullable: true })
  productId: number

  @Column({ type: 'int', nullable: true })
  variantId: number

  @Column({ type: 'varchar', length: 100 })
  itemCode: string

  @Column({ type: 'varchar', length: 255 })
  itemName: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  itemDescription: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number

  @Column({ type: 'varchar', length: 20, default: 'adet' })
  unit: string

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotalPrice: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 18 })
  vatRate: number

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  vatAmount: number

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalPrice: number

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'bit', default: 1 })
  isActive: boolean

  // Relations
  @ManyToOne(() => Order, order => order.orderLines, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order

  @ManyToOne(() => Product, product => product.id, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product

  @ManyToOne(() => ProductVariant, variant => variant.id, { nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date

  // Calculate prices before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  calculatePrices() {
    // Calculate subtotal (quantity * unit price)
    this.subtotalPrice = this.quantity * this.unitPrice

    // Calculate discount amount
    if (this.discountPercent > 0) {
      this.discountAmount = (this.subtotalPrice * this.discountPercent) / 100
    } else {
      this.discountAmount = this.discountAmount || 0
    }

    // Calculate VAT amount
    const vatableAmount = this.subtotalPrice - this.discountAmount
    this.vatAmount = (vatableAmount * this.vatRate) / 100

    // Calculate total price
    this.totalPrice = this.subtotalPrice - this.discountAmount + this.vatAmount
  }

  // Helper methods
  get formattedUnitPrice(): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: this.currency || 'TRY'
    }).format(this.unitPrice)
  }

  get formattedTotalPrice(): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: this.currency || 'TRY'
    }).format(this.totalPrice)
  }

  get itemDisplayName(): string {
    if (this.variant) {
      let variantInfo = []
      if (this.variant.color) variantInfo.push(this.variant.color)
      if (this.variant.size) variantInfo.push(this.variant.size)
      if (this.variant.material) variantInfo.push(this.variant.material)
      
      return variantInfo.length > 0 
        ? `${this.itemName} (${variantInfo.join(', ')})`
        : this.itemName
    }
    return this.itemName
  }

  get hasVariant(): boolean {
    return !!this.variantId
  }

  get hasDiscount(): boolean {
    return this.discountAmount > 0 || this.discountPercent > 0
  }
} 