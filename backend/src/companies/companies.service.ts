import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // Create new company
  async create(createCompanyDto: CreateCompanyDto, user: User): Promise<Company> {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      createdById: user.id,
      createdBy: user,
    });

    const savedCompany = await this.companyRepository.save(company);
    return this.findOneWithRelations(savedCompany.id);
  }

  // Get all companies with pagination and filtering
  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    userId?: string
  ): Promise<{ companies: Company[]; total: number; pages: number }> {
    const queryBuilder = this.companyRepository.createQueryBuilder('company')
      .leftJoinAndSelect('company.createdBy', 'createdBy')
      .orderBy('company.createdAt', 'DESC');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(company.name ILIKE :search OR company.email ILIKE :search OR company.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('company.status = :status', { status });
    }

    // User filter (optional - for user-specific companies)
    if (userId) {
      queryBuilder.andWhere('company.createdById = :userId', { userId });
    }

    // Only active companies by default
    queryBuilder.andWhere('company.isActive = :isActive', { isActive: true });

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const companies = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      companies: companies.map(company => ({
        ...company,
        createdBy: company.createdBy ? {
          id: company.createdBy.id,
          firstName: company.createdBy.firstName,
          lastName: company.createdBy.lastName,
          email: company.createdBy.email
        } : null
      } as any)),
      total,
      pages,
    };
  }

  // Get single company by ID
  async findOne(id: string): Promise<Company> {
    const company = await this.findOneWithRelations(id);
    
    if (!company) {
      throw new NotFoundException(`ID'si ${id} olan firma bulunamadı`);
    }

    return company;
  }

  // Update company
  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: User): Promise<Company> {
    const company = await this.findOne(id);

    // Check if user has permission to update (company creator or admin)
    if (company.createdById !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Bu firmayı güncelleme yetkiniz yok');
    }

    await this.companyRepository.update(id, updateCompanyDto);
    return this.findOne(id);
  }

  // Soft delete company (set isActive to false)
  async remove(id: string, user: User): Promise<void> {
    const company = await this.findOne(id);

    // Check if user has permission to delete (company creator or admin)
    if (company.createdById !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Bu firmayı silme yetkiniz yok');
    }

    await this.companyRepository.update(id, { isActive: false });
  }

  // Helper method to find company with relations
  private async findOneWithRelations(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id, isActive: true },
      relations: ['createdBy'],
    });
  }

  // Get company statistics
  async getStats(userId?: string): Promise<{
    total: number;
    leads: number;
    prospects: number;
    customers: number;
    inactive: number;
  }> {
    const queryBuilder = this.companyRepository.createQueryBuilder('company')
      .where('company.isActive = :isActive', { isActive: true });

    if (userId) {
      queryBuilder.andWhere('company.createdById = :userId', { userId });
    }

    const [total, leads, prospects, customers, inactive] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('company.status = :status', { status: 'lead' }).getCount(),
      queryBuilder.clone().andWhere('company.status = :status', { status: 'prospect' }).getCount(),
      queryBuilder.clone().andWhere('company.status = :status', { status: 'customer' }).getCount(),
      queryBuilder.clone().andWhere('company.status = :status', { status: 'inactive' }).getCount(),
    ]);

    return {
      total,
      leads,
      prospects,
      customers,
      inactive,
    };
  }
} 