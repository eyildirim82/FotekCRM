import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Order } from '../entities/order.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Company } from '../entities/company.entity';
import { Product } from '../entities/product.entity';
import { Contact } from '../entities/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Invoice, Company, Product, Contact])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
