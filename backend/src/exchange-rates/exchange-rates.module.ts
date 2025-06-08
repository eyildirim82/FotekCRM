import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExchangeRatesService } from './exchange-rates.service'
import { ExchangeRatesController } from './exchange-rates.controller'
import { TcmbService } from './tcmb.service'
import { ExchangeRate } from '../entities/exchange-rate.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeRate]),
  ],
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService, TcmbService],
  exports: [ExchangeRatesService, TcmbService],
})
export class ExchangeRatesModule {} 