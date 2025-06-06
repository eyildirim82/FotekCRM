import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private readonly companyRepository;
    constructor(companyRepository: Repository<Company>);
    create(createCompanyDto: CreateCompanyDto, user: User): Promise<Company>;
    findAll(page?: number, limit?: number, search?: string, status?: string, userId?: string): Promise<{
        companies: Company[];
        total: number;
        pages: number;
    }>;
    findOne(id: string): Promise<Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto, user: User): Promise<Company>;
    remove(id: string, user: User): Promise<void>;
    private findOneWithRelations;
    getStats(userId?: string): Promise<{
        total: number;
        leads: number;
        prospects: number;
        customers: number;
        inactive: number;
    }>;
}
