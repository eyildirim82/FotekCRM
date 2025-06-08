import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { InvoiceLine } from './invoice-line.entity'

// MSSQL enum desteği olmadığı için string olarak tanımlandı
// InvoiceStatus: 'draft' | 'sent' | 'paid' | 'cancelled'
// InvoiceType: 'sales' | 'purchase'

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string

  @Column({ type: 'varchar', length: 20, default: 'sales' })
  type: string

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string

  @Column({ type: 'date' })
  invoiceDate: Date

  @Column({ type: 'date', nullable: true })
  dueDate: Date

  // Müşteri/Tedarikçi bilgileri
  @Column({ type: 'uuid', nullable: true })
  companyId: string

  @Column({ type: 'uuid', nullable: true })
  contactId: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerAddress: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  customerTaxNumber: string

  // Fatura satırları
  @OneToMany(() => InvoiceLine, invoiceLine => invoiceLine.invoice, { cascade: true })
  lines: InvoiceLine[]

  // Tutar hesaplamaları
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number // KDV hariç toplam

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDiscount: number // Toplam iskonto

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVat: number // Toplam KDV

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number // KDV dahil toplam

  // Notlar
  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'text', nullable: true })
  terms: string

  // Para birimi
  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  exchangeRate: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 