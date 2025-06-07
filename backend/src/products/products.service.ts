import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number): Promise<Product> {
    // Code unique kontrolü
    const existingProduct = await this.productRepository.findOne({
      where: { code: createProductDto.code }
    });

    if (existingProduct) {
      throw new ConflictException('Bu ürün kodu zaten kullanılmaktadır');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      createdById: userId,
    });

    return await this.productRepository.save(product);
  }

  async findAll(userId: number, page: number = 1, limit: number = 10, search?: string) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .where('product.deletedAt IS NULL');

    if (search) {
      query.andWhere(
        '(product.name LIKE :search OR product.code LIKE :search OR product.description LIKE :search OR product.category LIKE :search)',
        { search: `%${search}%` }
      );
    }

    query.orderBy('product.createdAt', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, includeVariants: boolean = false): Promise<Product> {
    const relations = ['company', 'createdBy', 'updatedBy'];
    
    if (includeVariants) {
      relations.push('variants');
    }

    const product = await this.productRepository.findOne({
      where: { id, deletedAt: null },
      relations,
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number): Promise<Product> {
    const product = await this.findOne(id);

    // Code unique kontrolü (kendisi hariç)
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.productRepository.findOne({
        where: { code: updateProductDto.code }
      });

      if (existingProduct) {
        throw new ConflictException('Bu ürün kodu zaten kullanılmaktadır');
      }
    }

    Object.assign(product, updateProductDto);
    product.updatedById = userId;

    return await this.productRepository.save(product);
  }

  async remove(id: number, userId: number): Promise<void> {
    const product = await this.findOne(id);

    product.deletedAt = new Date();
    product.updatedById = userId;

    await this.productRepository.save(product);
  }

  async getStats(): Promise<any> {
    const totalProducts = await this.productRepository.count({
      where: { deletedAt: null }
    });

    const activeProducts = await this.productRepository.count({
      where: { isActive: true, deletedAt: null }
    });

    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stockQuantity <= product.minStockLevel')
      .andWhere('product.deletedAt IS NULL')
      .getCount();

    const outOfStockProducts = await this.productRepository.count({
      where: { stockQuantity: 0, deletedAt: null }
    });

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
    };
  }
} 