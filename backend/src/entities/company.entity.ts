import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200, nullable: false })
  name: string;

  @Column({ length: 50, nullable: true })
  taxNumber: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'bit', default: 1 })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, default: 'lead' })
  status: 'lead' | 'prospect' | 'customer' | 'inactive';

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @Column({ name: 'createdBy' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to convert to response object
  toResponseObject() {
    const { createdBy, ...company } = this;
    return {
      ...company,
      createdBy: createdBy ? {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
        email: createdBy.email
      } : null
    };
  }
} 