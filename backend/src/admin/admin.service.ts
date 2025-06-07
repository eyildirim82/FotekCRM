import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Contact } from '../entities/contact.entity';
import { Product } from '../entities/product.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getAllUsers() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
    
    return {
      users: users.map(user => user.toResponseObject()),
      total: users.length,
    };
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    
    return user.toResponseObject();
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    
    return savedUser.toResponseObject();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Email unique kontrolü
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Bu email adresi zaten kullanılıyor');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    
    return updatedUser.toResponseObject();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.usersRepository.remove(user);
    
    return { message: 'Kullanıcı başarıyla silindi' };
  }

  async getSystemStats() {
    const [
      totalUsers,
      totalCompanies,
      totalContacts,
      totalProducts,
      adminUsers,
      activeUsers,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.companiesRepository.count(),
      this.contactsRepository.count(),
      this.productsRepository.count(),
      this.usersRepository.count({ where: { role: 'admin' } }),
      this.usersRepository.count({ where: { isActive: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
        admin: adminUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      entities: {
        companies: totalCompanies,
        contacts: totalContacts,
        products: totalProducts,
      },
      timestamp: new Date().toISOString(),
    };
  }
} 