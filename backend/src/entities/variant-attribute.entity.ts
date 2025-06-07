import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('variant_attributes')
export class VariantAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // Attribute display name (e.g., "Renk", "Beden", "Kapasite")

  @Column({ type: 'varchar', length: 50, unique: true })
  type: string; // Attribute type key (e.g., "color", "size", "capacity")

  @Column({ type: 'text', nullable: true })
  description: string; // Attribute description

  @Column({ type: 'text', nullable: true })
  values: string; // Predefined values JSON string (e.g., '["Kırmızı", "Mavi", "Yeşil"]')

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // Display sort order

  @Column({ type: 'bit', default: 1 })
  isActive: boolean; // Aktif/pasif

  @Column({ type: 'bit', default: 0 })
  isRequired: boolean; // Bu attribute zorunlu mu

  @Column({ type: 'bit', default: 1 })
  allowCustomValues: boolean; // Kullanıcı özel değer girebilir mi

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
  deletedAt: Date | null;
} 