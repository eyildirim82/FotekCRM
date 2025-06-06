import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { Company } from './company.entity'
import { User } from './user.entity'

export enum ContactType {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  DECISION_MAKER = 'decision_maker',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  OTHER = 'other'
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEFT_COMPANY = 'left_company',
  NO_CONTACT = 'no_contact'
}

@Entity('contacts')
@Index(['companyId'])
@Index(['createdById'])
@Index(['email'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Basic Information
  @Column({ type: 'nvarchar', length: 100 })
  firstName: string

  @Column({ type: 'nvarchar', length: 100 })
  lastName: string

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email?: string

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  phone?: string

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  mobile?: string

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  jobTitle?: string

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  department?: string

  // Contact Details
  @Column({
    type: 'nvarchar',
    length: 20,
    enum: ContactType,
    default: ContactType.EMPLOYEE
  })
  contactType: ContactType

  @Column({
    type: 'nvarchar', 
    length: 20,
    enum: ContactStatus,
    default: ContactStatus.ACTIVE
  })
  status: ContactStatus

  @Column({ type: 'bit', default: 1 })
  isPrimary: boolean

  @Column({ type: 'bit', default: 1 })
  isActive: boolean

  // Additional Information
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  linkedInUrl?: string

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  skype?: string

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  address?: string

  @Column({ type: 'date', nullable: true })
  birthDate?: Date

  @Column({ type: 'ntext', nullable: true })
  notes?: string

  // Relations
  @Column({ type: 'uniqueidentifier' })
  companyId: string

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'companyId' })
  company: Company

  @Column({ type: 'uniqueidentifier' })
  createdById: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User

  // Timestamps
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  get displayName(): string {
    return this.jobTitle 
      ? `${this.fullName} (${this.jobTitle})`
      : this.fullName
  }
} 