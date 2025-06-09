import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Order } from '../entities/order.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Company } from '../entities/company.entity';
import { Product } from '../entities/product.entity';
import { Contact } from '../entities/contact.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(Invoice), useValue: {} },
        { provide: getRepositoryToken(Company), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(Contact), useValue: {} },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
