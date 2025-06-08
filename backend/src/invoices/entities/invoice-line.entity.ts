import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Invoice } from './invoice.entity'

// MSSQL enum desteği olmadığı için number olarak tanımlandı
// VatRate: 0 | 10 | 20

@Entity('invoice_lines')
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Fatura ilişkisi
  @ManyToOne(() => Invoice, invoice => invoice.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice

  @Column({ type: 'uuid' })
  invoiceId: string

  // Ürün bilgileri
  @Column({ type: 'uuid', nullable: true })
  productId: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  productCode: string

  @Column({ type: 'varchar', length: 255 })
  description: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string

  // Miktar ve fiyat
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number

  // İskonto
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number

  // KDV
  @Column({ type: 'int', default: 20 })
  vatRate: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatAmount: number

  // Hesaplanan tutarlar
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lineTotal: number // İskonto sonrası, KDV hariç

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lineTotalWithVat: number // KDV dahil toplam

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Hesaplama metodları
  calculateAmounts(): void {
    const subtotal = this.quantity * this.unitPrice
    this.discountAmount = subtotal * (this.discountPercent / 100)
    this.lineTotal = subtotal - this.discountAmount
    this.vatAmount = this.lineTotal * (this.vatRate / 100)
    this.lineTotalWithVat = this.lineTotal + this.vatAmount
  }
} 