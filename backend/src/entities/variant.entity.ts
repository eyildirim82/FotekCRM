import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string; // Unique variant SKU (Stock Keeping Unit)

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string; // Renk (Kırmızı, Mavi, vb.)

  @Column({ type: 'varchar', length: 20, nullable: true })
  size: string; // Beden (S, M, L, XL, 38, 40, vb.)

  @Column({ type: 'varchar', length: 50, nullable: true })
  capacity: string; // Kapasite (500ml, 1L, 128GB, vb.)

  @Column({ type: 'varchar', length: 50, nullable: true })
  material: string; // Malzeme (Pamuk, Polyester, Metal, vb.)

  @Column({ type: 'varchar', length: 50, nullable: true })
  style: string; // Stil (Casual, Formal, Sport, vb.)

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  unitPrice: number; // Varyant birim fiyatı

  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string; // Para birimi

  @Column({ type: 'int', default: 0 })
  stockQuantity: number; // Varyant stok miktarı

  @Column({ type: 'int', default: 0 })
  minStockLevel: number; // Minimum stok seviyesi

  @Column({ type: 'bit', default: 1 })
  isActive: boolean; // Aktif/pasif

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string; // Varyant resmi URL

  @Column({ type: 'text', nullable: true })
  notes: string; // Varyant notları

  // Ana ürün ilişkisi
  @ManyToOne(() => Product, product => product.variants, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  // Oluşturan kullanıcı
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: number;

  // Güncelleyen kullanıcı
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