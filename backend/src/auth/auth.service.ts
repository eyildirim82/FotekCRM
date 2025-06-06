import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.userRepository.findOne({ 
      where: { email, isActive: true } 
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user.toResponseObject(),
    };
  }

  async register(registerDto: RegisterDto) {
    const { email } = registerDto;
    
    const existingUser = await this.userRepository.findOne({ 
      where: { email } 
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    const user = this.userRepository.create(registerDto);
    await this.userRepository.save(user);

    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user.toResponseObject(),
    };
  }

  async validateUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true }
    });
    
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }
    
    return user.toResponseObject();
  }
} 