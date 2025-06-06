"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const common_1 = require("@nestjs/common");
describe('AuthService', () => {
    let service;
    let mockUserRepository;
    let mockJwtService;
    beforeEach(async () => {
        mockUserRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };
        mockJwtService = {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
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
            await expect(service.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
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
            mockUserRepository.findOne.mockResolvedValue(null);
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
            mockUserRepository.findOne.mockResolvedValue({ id: '1' });
            await expect(service.register(registerDto)).rejects.toThrow(common_1.ConflictException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map