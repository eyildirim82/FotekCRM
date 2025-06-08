import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthModule } from '../backend/src/auth/auth.module';
import { User } from '../backend/src/entities/user.entity';

describe('Authentication Module (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mssql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '1433', 10),
          username: process.env.DB_USER || 'sa',
          password: process.env.DB_PASSWORD || 'TestPassword123!',
          database: 'fotek_test',
          entities: [User],
          synchronize: true,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration', () => {
    test('Başarılı kullanıcı kaydı', async () => {
      const userData = {
        email: 'test@fotek.com',
        firstName: 'Test',
        lastName: 'Kullanıcı',
        password: 'GüçlüŞifre123!'
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      
      authToken = response.body.access_token;
    });

    test('Zayıf şifre ile kayıt - hata kontrolü', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test2@fotek.com',
          firstName: 'Test',
          lastName: 'User',
          password: '123'
        })
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    test('Duplicate email kontrolü', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@fotek.com', // Aynı email
          firstName: 'Başka',
          lastName: 'Kullanıcı',
          password: 'GüçlüŞifre123!'
        })
        .expect(409);

      expect(response.body.message).toMatch(/email.*zaten.*kullanılıyor/i);
    });

    test('Geçersiz email formatı', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'geçersiz-email',
          firstName: 'Test',
          lastName: 'User',
          password: 'GüçlüŞifre123!'
        })
        .expect(400);
    });
  });

  describe('User Login', () => {
    test('Geçerli kredentiyaller ile giriş', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@fotek.com',
          password: 'GüçlüŞifre123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe('test@fotek.com');
      expect(typeof response.body.access_token).toBe('string');
    });

    test('Yanlış şifre ile giriş', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@fotek.com',
          password: 'YanlışŞifre'
        })
        .expect(401);

      expect(response.body.message).toMatch(/geçersiz.*email.*şifre/i);
    });

    test('Olmayan email ile giriş', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'olmayan@fotek.com',
          password: 'HerhangiBirŞifre'
        })
        .expect(401);

      expect(response.body.message).toMatch(/geçersiz.*email.*şifre/i);
    });

    test('Eksik alanlar ile giriş', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@fotek.com'
          // password eksik
        })
        .expect(400);
    });
  });

  describe('Protected Routes', () => {
    test('Geçerli token ile korumalı endpoint erişimi', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@fotek.com');
    });

    test('Token olmadan korumalı endpoint erişimi', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    test('Geçersiz token ile erişim', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('Malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('Security Tests', () => {
    test('SQL Injection önleme - email alanında', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "'; DROP TABLE users; --",
          password: 'test'
        })
        .expect(401); // Başarısız olmalı, ancak hata vermemeli
    });

    test('XSS önleme - firstName alanında', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'xss@fotek.com',
          firstName: '<script>alert("XSS")</script>',
          lastName: 'Test',
          password: 'GüçlüŞifre123!'
        })
        .expect(400);

      expect(response.body.message).toContain('firstName');
    });

    test('Very long password attack', async () => {
      const longPassword = 'a'.repeat(1000);
      
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'longpassword@fotek.com',
          firstName: 'Test',
          lastName: 'User',
          password: longPassword
        })
        .expect(400);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('Çok fazla başarısız giriş denemesi', async () => {
      const email = 'ratelimit@fotek.com';
      
      // 5 başarısız deneme yap
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: email,
            password: 'yanlışşifre'
          })
          .expect(401);
      }

      // 6. deneme rate limit'e takılmalı
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: email,
          password: 'yanlışşifre'
        })
        .expect(429);

      expect(response.body.message).toMatch(/çok.*fazla.*deneme/i);
    });
  });
}); 