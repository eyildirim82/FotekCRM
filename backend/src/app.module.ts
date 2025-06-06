import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ContactsModule } from './contacts/contacts.module';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT) || 1433,
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'FotekCRM2025!',
      database: process.env.DB_NAME || 'master',
      entities: [User, Company, Contact],
      synchronize: true, // Only for development
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    CompaniesModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 