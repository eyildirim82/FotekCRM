import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ContactsModule } from './contacts/contacts.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { VariantsModule } from './variants/variants.module';
import { OrdersModule } from './orders/orders.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Contact } from './entities/contact.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/variant.entity';
import { VariantAttribute } from './entities/variant-attribute.entity';
import { Order } from './entities/order.entity';
import { OrderLine } from './entities/order-line.entity';
import { StockTransaction } from './entities/stock-transaction.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceLine } from './invoices/entities/invoice-line.entity';
import { InvoicesModule } from './invoices/invoices.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '1433', 10),
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'FotekCRM2025!',
      database: process.env.DB_NAME || 'master',
      entities: [User, Company, Contact, Product, ProductVariant, VariantAttribute, Order, OrderLine, StockTransaction, ExchangeRate, Invoice, InvoiceLine],
      synchronize: true, // Only for development
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    CompaniesModule,
    ContactsModule,
    ProductsModule,
    AdminModule,
    VariantsModule,
    OrdersModule,
    ExchangeRatesModule,
    InvoicesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 