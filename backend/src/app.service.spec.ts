import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return hello message', () => {
      const result = service.getHello();
      expect(result).toBe('Fotek CRM API v1.0 - NestJS Backend!');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = service.getHealth();
      
      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('service', 'Fotek CRM API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('environment');
      
      // Timestamp should be a valid ISO string
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

      it('should return current environment', () => {
    const result = service.getHealth();
    expect(typeof result.environment).toBe('string');
    expect(result.environment).toBeTruthy();
  });
  });
}); 