import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  TRY = 'TRY'
}

export enum RateType {
  BUYING = 'buying',
  SELLING = 'selling'
}

@Entity('exchange_rates')
@Index(['currency', 'date'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 3 })
  currency: Currency

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  buyingRate: number

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  sellingRate: number

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  effectiveBuyingRate: number

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  effectiveSellingRate: number

  @Column({ type: 'date' })
  date: string

  @Column({ type: 'varchar', length: 50, default: 'TCMB' })
  source: string

  @Column({ type: 'bit', default: 1 })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Helper methods
  getDisplayRate(type: RateType = RateType.SELLING): number {
    return type === RateType.BUYING ? this.buyingRate : this.sellingRate
  }

  getFormattedRate(type: RateType = RateType.SELLING): string {
    const rate = this.getDisplayRate(type)
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(Number(rate))
  }

  static getCurrencySymbol(currency: Currency): string {
    const symbols = {
      [Currency.USD]: '$',
      [Currency.EUR]: '€',
      [Currency.GBP]: '£',
      [Currency.TRY]: '₺'
    }
    return symbols[currency] || currency
  }

  static getCurrencyName(currency: Currency): string {
    const names = {
      [Currency.USD]: 'Amerikan Doları',
      [Currency.EUR]: 'Euro',
      [Currency.GBP]: 'İngiliz Sterlini',
      [Currency.TRY]: 'Türk Lirası'
    }
    return names[currency] || currency
  }
} 