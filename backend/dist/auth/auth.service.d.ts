import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: Omit<User, "password" | "hashPassword" | "validatePassword" | "toResponseObject">;
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: Omit<User, "password" | "hashPassword" | "validatePassword" | "toResponseObject">;
    }>;
    validateUser(id: string): Promise<Omit<User, "password" | "hashPassword" | "validatePassword" | "toResponseObject">>;
}
