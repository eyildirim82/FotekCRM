import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm'
import { User } from './user.entity'
import { Company } from './company.entity'
import { OrderLine } from './order-line.entity'
import { StockTransaction } from './stock-transaction.entity'

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string

  @Column({ type: 'uniqueidentifier' })
  customerId: string

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  subtotalAmount: number

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  vatAmount: number

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number

  @Column({ 
    type: 'varchar', 
    length: 3, 
    default: 'TRY',
    enum: Currency
  })
  currency: string

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'draft',
    enum: OrderStatus
  })
  status: string

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  orderDate: Date

  @Column({ type: 'datetime2', nullable: true })
  deliveryDate: Date

  @Column({ type: 'datetime2', nullable: true })
  shippedDate: Date

  @Column({ type: 'varchar', length: 255, nullable: true })
  shippingAddress: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  shippingMethod: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentStatus: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'text', nullable: true })
  internalNotes: string

  @Column({ type: 'bit', default: 1 })
  isActive: boolean

  // Relations
  @ManyToOne(() => Company, company => company.id, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer: Company

  @OneToMany(() => OrderLine, orderLine => orderLine.order, { cascade: true })
  orderLines: OrderLine[]

  @OneToMany(() => StockTransaction, stockTransaction => stockTransaction.order)
  stockTransactions: StockTransaction[]

  // Audit fields
  @Column({ type: 'uniqueidentifier' })
  createdById: string

  @ManyToOne(() => User, user => user.id, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User

  @Column({ type: 'uniqueidentifier', nullable: true })
  updatedById: string

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'datetime2' })
  deletedAt: Date

  // Generate order number before insert
  @BeforeInsert()
  generateOrderNumber() {
    if (!this.orderNumber) {
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      const timestamp = Date.now().toString().slice(-6)
      this.orderNumber = `ORD-${year}${month}-${timestamp}`
    }
  }

  // Calculated properties
  calculateTotals() {
    if (this.orderLines) {
      this.subtotalAmount = this.orderLines.reduce((sum, line) => sum + line.totalPrice, 0)
      this.vatAmount = this.orderLines.reduce((sum, line) => sum + (line.vatAmount || 0), 0)
      this.totalAmount = this.subtotalAmount + this.vatAmount - this.discountAmount
    }
  }

  // Status helpers
  get statusText(): string {
    const statusTexts = {
      draft: 'Taslak',
      confirmed: 'Onaylandı',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    }
    return statusTexts[this.status] || this.status
  }

  get statusColor(): string {
    const statusColors = {
      draft: 'default',
      confirmed: 'processing',
      shipped: 'warning',
      delivered: 'success',
      cancelled: 'error'
    }
    return statusColors[this.status] || 'default'
  }

  get isEditable(): boolean {
    return this.status === 'draft'
  }

  get isCancellable(): boolean {
    return ['draft', 'confirmed'].includes(this.status)
  }
} 