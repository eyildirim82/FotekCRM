import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'Test Ürün',
        code: 'TEST001',
        description: 'Test açıklaması',
        listPrice: 100,
      };
      const userId = 1;
      const savedProduct = { id: 1, ...createProductDto, createdById: userId };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedProduct);
      mockRepository.save.mockResolvedValue(savedProduct);

      const result = await service.create(createProductDto, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { code: createProductDto.code }
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        createdById: userId,
      });
      expect(result).toEqual(savedProduct);
    });

    it('should throw ConflictException if product code already exists', async () => {
      const createProductDto = {
        name: 'Test Ürün',
        code: 'TEST001',
      };
      const userId = 1;
      const existingProduct = { id: 1, code: 'TEST001' };

      mockRepository.findOne.mockResolvedValue(existingProduct);

      await expect(service.create(createProductDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const productId = 1;
      const product = { id: productId, name: 'Test Ürün', deletedAt: null };

      mockRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(productId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId, deletedAt: null },
        relations: ['company', 'createdBy', 'updatedBy'],
      });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = 1;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return product statistics', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      };

      mockRepository.count
        .mockResolvedValueOnce(100) // totalProducts
        .mockResolvedValueOnce(80)  // activeProducts
        .mockResolvedValueOnce(2);  // outOfStockProducts

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStats();

      expect(result).toEqual({
        totalProducts: 100,
        activeProducts: 80,
        lowStockProducts: 5,
        outOfStockProducts: 2,
      });
    });
  });
}); 