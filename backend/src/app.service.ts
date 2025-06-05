import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Fotek CRM API v1.0 - NestJS Backend!';
  }

  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Fotek CRM API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }
} 