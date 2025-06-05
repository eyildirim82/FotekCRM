import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS'u etkinleştir
  app.enableCors();
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log('🚀 Fotek CRM API running on http://localhost:3000');
}

bootstrap(); 