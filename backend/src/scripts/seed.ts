import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '../auth/roles.enum';

async function seed() {
  console.log('🌱 Seed script başlatılıyor...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    // Admin kullanıcısı kontrolü ve oluşturma
    const existingAdmin = await userRepository.findOne({ 
      where: { email: 'admin@fotek.com' } 
    });

    if (!existingAdmin) {
      const admin = userRepository.create({
        email: 'admin@fotek.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123', // hashPassword BeforeInsert ile çalışacak
        role: UserRole.ADMIN,
        isActive: true,
      });

      await userRepository.save(admin);
      console.log('✅ Admin kullanıcı oluşturuldu: admin@fotek.com');
    } else {
      console.log('📋 Admin kullanıcı zaten mevcut: admin@fotek.com');
    }

    // Demo user kontrolü ve oluşturma
    const existingUser = await userRepository.findOne({ 
      where: { email: 'user@fotek.com' } 
    });

    if (!existingUser) {
      const user = userRepository.create({
        email: 'user@fotek.com',
        firstName: 'Demo',
        lastName: 'User',
        password: 'user123', // hashPassword BeforeInsert ile çalışacak
        role: UserRole.USER,
        isActive: true,
      });

      await userRepository.save(user);
      console.log('✅ Demo kullanıcı oluşturuldu: user@fotek.com');
    } else {
      console.log('📋 Demo kullanıcı zaten mevcut: user@fotek.com');
    }

    // Manager kullanıcısı (opsiyonel)
    const existingManager = await userRepository.findOne({ 
      where: { email: 'manager@fotek.com' } 
    });

    if (!existingManager) {
      const manager = userRepository.create({
        email: 'manager@fotek.com',
        firstName: 'Manager',
        lastName: 'User',
        password: 'manager123',
        role: UserRole.MANAGER,
        isActive: true,
      });

      await userRepository.save(manager);
      console.log('✅ Manager kullanıcı oluşturuldu: manager@fotek.com');
    } else {
      console.log('📋 Manager kullanıcı zaten mevcut: manager@fotek.com');
    }

    console.log('🎉 Seed script başarıyla tamamlandı!');
    console.log('📧 Test Hesapları:');
    console.log('   Admin: admin@fotek.com / admin123');
    console.log('   User:  user@fotek.com / user123');
    console.log('   Manager: manager@fotek.com / manager123');

  } catch (error) {
    console.error('❌ Seed script hatası:', error);
  } finally {
    await app.close();
  }
}

seed(); 