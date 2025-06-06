import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // Ürün adı

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // Ürün kodu (SKU)

  @Column({ type: 'text', nullable: true })
  description: string; // Ürün açıklaması

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // Kategori

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string; // Marka

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string; // Birim (adet, kg, m vb.)

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  listPrice: number; // Liste fiyatı

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  costPrice: number; // Maliyet fiyatı

  @Column({ type: 'int', default: 20 })
  vatRate: number; // KDV oranı (0, 1, 8, 18, 20)

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string; // Para birimi

  @Column({ type: 'int', default: 0 })
  stockQuantity: number; // Stok miktarı

  @Column({ type: 'int', default: 0 })
  minStockLevel: number; // Minimum stok seviyesi

  @Column({ type: 'bit', default: 1 })
  isActive: boolean; // Aktif/pasif

  @Column({ type: 'bit', default: 0 })
  isService: boolean; // Hizmet mi ürün mü

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string; // Ürün resmi URL

  @Column({ type: 'text', nullable: true })
  notes: string; // Notlar

  // İlişkiler
  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: number;

  // Timestamp alanları
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
} 