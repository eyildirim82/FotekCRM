import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ExchangeRatesService, ExchangeRateFilters } from './exchange-rates.service'
import { TcmbService } from './tcmb.service'
import { Currency } from '../entities/exchange-rate.entity'

@Controller('exchange-rates')
@UseGuards(JwtAuthGuard)
export class ExchangeRatesController {
  constructor(
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly tcmbService: TcmbService,
  ) {}

  // Kur listesi
  @Get()
  async findAll(@Query() query: any) {
    try {
      const filters: ExchangeRateFilters = {
        currency: query.currency,
        startDate: query.startDate,
        endDate: query.endDate,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 50,
      }

      const result = await this.exchangeRatesService.findAll(filters)

      return {
        success: true,
        message: 'Kur listesi başarıyla alındı',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: null,
      }
    }
  }

  // Tek kur kaydı
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const rate = await this.exchangeRatesService.findOne(id)

      return {
        success: true,
        message: 'Kur kaydı başarıyla alındı',
        data: rate,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }
  }

  // En güncel kurlar
  @Get('latest/all')
  async getLatestRates() {
    try {
      const rates = await this.exchangeRatesService.getLatestRates()

      return {
        success: true,
        message: 'En güncel kurlar başarıyla alındı',
        data: rates,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      }
    }
  }

  // Belirli para birimi için en güncel kur
  @Get('latest/:currency')
  async getLatestRateForCurrency(@Param('currency') currency: Currency) {
    try {
      const rate = await this.exchangeRatesService.getLatestRateForCurrency(currency)

      return {
        success: true,
        message: `${currency} kuru başarıyla alındı`,
        data: rate,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }
  }

  // Kur istatistikleri
  @Get('stats/summary')
  async getStats() {
    try {
      const stats = await this.exchangeRatesService.getStats()

      return {
        success: true,
        message: 'Kur istatistikleri başarıyla alındı',
        data: stats,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }
  }

  // Bugünkü kurlar
  @Get('today/rates')
  async getTodayRates() {
    try {
      const rates = await this.exchangeRatesService.getTodayRates()

      return {
        success: true,
        message: 'Bugünkü kurlar başarıyla alındı',
        data: rates,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      }
    }
  }

  // Para birimi listesi
  @Get('currencies/supported')
  getSupportedCurrencies() {
    try {
      const currencies = this.exchangeRatesService.getSupportedCurrencies()

      return {
        success: true,
        message: 'Desteklenen para birimleri alındı',
        data: currencies,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      }
    }
  }

  // Para birimi çevirme
  @Get('convert/:amount/:from/:to')
  async convertCurrency(
    @Param('amount') amount: string,
    @Param('from') fromCurrency: Currency,
    @Param('to') toCurrency: Currency,
  ) {
    try {
      const amountNum = parseFloat(amount)
      const convertedAmount = await this.exchangeRatesService.convertCurrency(
        amountNum,
        fromCurrency,
        toCurrency,
      )

      return {
        success: true,
        message: 'Para birimi çevirme başarılı',
        data: {
          originalAmount: amountNum,
          fromCurrency,
          toCurrency,
          convertedAmount,
          rate: convertedAmount / amountNum,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }
  }

  // Kur geçmişi
  @Get('history/:currency')
  async getRateHistory(
    @Param('currency') currency: Currency,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!startDate || !endDate) {
        return {
          success: false,
          message: 'Başlangıç ve bitiş tarihleri gereklidir',
          data: [],
        }
      }

      const history = await this.exchangeRatesService.getRateHistory(
        currency,
        startDate,
        endDate,
      )

      return {
        success: true,
        message: `${currency} kur geçmişi başarıyla alındı`,
        data: history,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      }
    }
  }

  // Manuel kur güncelleme (admin only)
  @Post('update')
  @HttpCode(HttpStatus.OK)
  async updateRates() {
    try {
      const updatedRates = await this.exchangeRatesService.updateRates()

      return {
        success: true,
        message: `${updatedRates.length} kur başarıyla güncellendi`,
        data: updatedRates,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      }
    }
  }

  // TCMB senkronizasyonu (admin only)
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncFromTcmb() {
    try {
      const syncResult = await this.tcmbService.updateExchangeRates()

      return {
        success: true,
        message: 'TCMB kurları başarıyla senkronize edildi',
        data: syncResult,
      }
    } catch (error) {
      return {
        success: false,
        message: `TCMB senkronizasyon hatası: ${error.message}`,
        data: null,
      }
    }
  }
} 