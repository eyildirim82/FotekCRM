import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { Order } from '../entities/order.entity'
import { OrderLine } from '../entities/order-line.entity'
import { StockTransaction } from '../entities/stock-transaction.entity'
import { Product } from '../entities/product.entity'
import { ProductVariant } from '../entities/variant.entity'
import { Company } from '../entities/company.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderLine,
      StockTransaction,
      Product,
      ProductVariant,
      Company,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {} 