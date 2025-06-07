import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { ProductVariant } from '../entities/variant.entity';
import { Product } from '../entities/product.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createVariantDto: CreateVariantDto, userId: number): Promise<ProductVariant> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createVariantDto.productId, deletedAt: null }
    });
    
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Check if SKU already exists
    const existingVariant = await this.variantRepository.findOne({
      where: { sku: createVariantDto.sku, deletedAt: null }
    });

    if (existingVariant) {
      throw new ConflictException('Bu SKU zaten kullanılıyor');
    }

    // Create variant
    const variant = this.variantRepository.create({
      ...createVariantDto,
      createdById: userId,
    });

    return await this.variantRepository.save(variant);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    productId?: number,
    color?: string,
    size?: string,
    isActive?: boolean
  ) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    
    if (search) {
      where.sku = Like(`%${search}%`);
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    if (color) {
      where.color = Like(`%${color}%`);
    }
    
    if (size) {
      where.size = Like(`%${size}%`);
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const options: FindManyOptions<ProductVariant> = {
      where,
      relations: ['product', 'createdBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    const [variants, total] = await this.variantRepository.findAndCount(options);

    return {
      data: variants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['product', 'createdBy', 'updatedBy'],
    });

    if (!variant) {
      throw new NotFoundException('Varyant bulunamadı');
    }

    return variant;
  }

  async findByProduct(productId: number): Promise<ProductVariant[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId, deletedAt: null }
    });
    
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return await this.variantRepository.find({
      where: { productId, deletedAt: null },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateVariantDto: UpdateVariantDto, userId: number): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    // If SKU is being updated, check for conflicts
    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const existingVariant = await this.variantRepository.findOne({
        where: { sku: updateVariantDto.sku, deletedAt: null }
      });

      if (existingVariant && existingVariant.id !== id) {
        throw new ConflictException('Bu SKU zaten kullanılıyor');
      }
    }

    // If productId is being updated, check if product exists
    if (updateVariantDto.productId && updateVariantDto.productId !== variant.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateVariantDto.productId, deletedAt: null }
      });
      
      if (!product) {
        throw new NotFoundException('Ürün bulunamadı');
      }
    }

    await this.variantRepository.update(id, {
      ...updateVariantDto,
      updatedById: userId,
    });

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const variant = await this.findOne(id);
    await this.variantRepository.softDelete(id);
  }

  async getStats() {
    const totalVariants = await this.variantRepository.count({
      where: { deletedAt: null }
    });

    const activeVariants = await this.variantRepository.count({
      where: { deletedAt: null, isActive: true }
    });

    const lowStockVariants = await this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.deletedAt IS NULL')
      .andWhere('variant.stockQuantity <= variant.minStockLevel')
      .andWhere('variant.minStockLevel > 0')
      .getCount();

    const outOfStockVariants = await this.variantRepository.count({
      where: { deletedAt: null, stockQuantity: 0 }
    });

    const totalStockValue = await this.variantRepository
      .createQueryBuilder('variant')
      .select('SUM(variant.stockQuantity * variant.unitPrice)', 'total')
      .where('variant.deletedAt IS NULL')
      .getRawOne();

    const variantsByColor = await this.variantRepository
      .createQueryBuilder('variant')
      .select('variant.color', 'color')
      .addSelect('COUNT(*)', 'count')
      .where('variant.deletedAt IS NULL')
      .andWhere('variant.color IS NOT NULL')
      .groupBy('variant.color')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalVariants,
      activeVariants,
      lowStockVariants,
      outOfStockVariants,
      totalStockValue: parseFloat(totalStockValue?.total || '0'),
      variantsByColor,
    };
  }
} 