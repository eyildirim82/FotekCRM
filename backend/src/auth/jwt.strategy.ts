import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fotek-jwt-secret-key-2025',
    });
  }

  async validate(payload: any) {
    const { id } = payload;
    const user = await this.userRepository.findOne({ 
      where: { id, isActive: true } 
    });

    if (!user) {
      throw new UnauthorizedException('Token geçersiz');
    }

    return user.toResponseObject();
  }
} 