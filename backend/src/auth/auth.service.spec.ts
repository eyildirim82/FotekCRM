import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = { email: 'test@test.com', password: 'password123' };
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        role: 'user',
        validatePassword: jest.fn().mockResolvedValue(true),
        toResponseObject: jest.fn().mockReturnValue({ id: '1', email: 'test@test.com' }),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email, isActive: true }
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@test.com', password: 'wrongpassword' };
      
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user and return access token', async () => {
      const registerDto = {
        email: 'new@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const mockUser = {
        id: '1',
        email: 'new@test.com',
        role: 'user',
        toResponseObject: jest.fn().mockReturnValue({ id: '1', email: 'new@test.com' }),
      };

      mockUserRepository.findOne.mockResolvedValue(null); // No existing user
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(mockUserRepository.create).toHaveBeenCalledWith(registerDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException for existing email', async () => {
      const registerDto = {
        email: 'existing@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1' }); // Existing user

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });
}); 