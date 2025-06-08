import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExchangeRate, Currency } from '../entities/exchange-rate.entity'
import { TcmbService } from './tcmb.service'

export interface ExchangeRateFilters {
  currency?: Currency
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ExchangeRateStats {
  totalRates: number
  currencies: number
  lastUpdateDate: string
  rates: {
    [key in Currency]?: {
      buyingRate: number
      sellingRate: number
      changeFromPreviousDay?: number
      changePercent?: number
    }
  }
}

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepository: Repository<ExchangeRate>,
    private tcmbService: TcmbService,
  ) {}

  // Kur listesi (filtreleme ve sayfalama ile)
  async findAll(filters: ExchangeRateFilters = {}) {
    const { currency, startDate, endDate, page = 1, limit = 50 } = filters

    const queryBuilder = this.exchangeRateRepository
      .createQueryBuilder('rate')
      .where('rate.isActive = :isActive', { isActive: true })

    // Currency filter
    if (currency) {
      queryBuilder.andWhere('rate.currency = :currency', { currency })
    }

    // Date range filter
    if (startDate) {
      queryBuilder.andWhere('rate.date >= :startDate', { startDate })
    }
    if (endDate) {
      queryBuilder.andWhere('rate.date <= :endDate', { endDate })
    }

    // Pagination
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    // Order by date desc, currency asc
    queryBuilder.orderBy('rate.date', 'DESC')
    queryBuilder.addOrderBy('rate.currency', 'ASC')

    const [rates, total] = await queryBuilder.getManyAndCount()

    return {
      data: rates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Tek kur kaydı getir
  async findOne(id: number): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepository.findOne({
      where: { id, isActive: true }
    })

    if (!rate) {
      throw new NotFoundException('Kur kaydı bulunamadı')
    }

    return rate
  }

  // En güncel kurları getir
  async getLatestRates(): Promise<ExchangeRate[]> {
    return await this.tcmbService.getLatestRates()
  }

  // Belirli para birimi için en güncel kuru getir
  async getLatestRateForCurrency(currency: Currency): Promise<ExchangeRate | null> {
    return await this.tcmbService.getLatestRateForCurrency(currency)
  }

  // Kur istatistikleri
  async getStats(): Promise<ExchangeRateStats> {
    // Toplam kur sayısı
    const totalRates = await this.exchangeRateRepository.count({
      where: { isActive: true }
    })

    // Para birimi sayısı
    const currencyCount = await this.exchangeRateRepository
      .createQueryBuilder('rate')
      .select('COUNT(DISTINCT rate.currency)', 'count')
      .where('rate.isActive = :isActive', { isActive: true })
      .getRawOne()

    // Son güncelleme tarihi
    const lastUpdate = await this.exchangeRateRepository.findOne({
      where: { isActive: true },
      order: { date: 'DESC' }
    })

    // En güncel kurlar
    const latestRates = await this.getLatestRates()

    // Her para birimi için önceki gün ile karşılaştırma
    const ratesWithChange: ExchangeRateStats['rates'] = {}

    for (const rate of latestRates) {
      // Önceki günün kurunu getir
      const previousRate = await this.exchangeRateRepository.findOne({
        where: {
          currency: rate.currency,
          isActive: true,
          date: this.getPreviousWorkday(rate.date)
        }
      })

      const change = previousRate ? rate.sellingRate - previousRate.sellingRate : 0
      const changePercent = previousRate ? (change / previousRate.sellingRate) * 100 : 0

      ratesWithChange[rate.currency] = {
        buyingRate: rate.buyingRate,
        sellingRate: rate.sellingRate,
        changeFromPreviousDay: change,
        changePercent: changePercent
      }
    }

    return {
      totalRates,
      currencies: parseInt(currencyCount.count),
      lastUpdateDate: lastUpdate?.date || '',
      rates: ratesWithChange
    }
  }

  // Manuel kur güncelleme
  async updateRates(): Promise<ExchangeRate[]> {
    return await this.tcmbService.updateExchangeRates()
  }

  // Para birimi çevirme
  async convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<number> {
    return await this.tcmbService.convertCurrency(amount, fromCurrency, toCurrency)
  }

  // Tarih geçmişi - belirli para birimi için
  async getRateHistory(
    currency: Currency,
    startDate: string,
    endDate: string
  ): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.find({
      where: {
        currency,
        isActive: true,
        date: `>= '${startDate}' AND <= '${endDate}'` as any
      },
      order: {
        date: 'ASC'
      }
    })
  }

  // Bugün için kurları getir
  async getTodayRates(): Promise<ExchangeRate[]> {
    const today = new Date().toISOString().split('T')[0]
    
    return await this.exchangeRateRepository.find({
      where: {
        date: today,
        isActive: true
      },
      order: {
        currency: 'ASC'
      }
    })
  }

  // Para birimi listesi
  getSupportedCurrencies(): Array<{currency: Currency, name: string, symbol: string}> {
    return [
      { currency: Currency.USD, name: 'Amerikan Doları', symbol: '$' },
      { currency: Currency.EUR, name: 'Euro', symbol: '€' },
      { currency: Currency.GBP, name: 'İngiliz Sterlini', symbol: '£' },
      { currency: Currency.TRY, name: 'Türk Lirası', symbol: '₺' }
    ]
  }

  // Yardımcı metodlar
  private getPreviousWorkday(dateString: string): string {
    const date = new Date(dateString)
    date.setDate(date.getDate() - 1)
    
    // Hafta sonu ise önceki cuma gününe git
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() - 1)
    }
    
    return date.toISOString().split('T')[0]
  }

  // Kur değişim yönü
  getChangeDirection(change: number): 'up' | 'down' | 'same' {
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'same'
  }

  // Kur formatla
  formatRate(rate: number, currency: Currency): string {
    const symbol = ExchangeRate.getCurrencySymbol(currency)
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === Currency.TRY ? 'TRY' : 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(rate)
  }
} 