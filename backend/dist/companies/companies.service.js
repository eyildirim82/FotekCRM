"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_entity_1 = require("../entities/company.entity");
let CompaniesService = class CompaniesService {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }
    async create(createCompanyDto, user) {
        const company = this.companyRepository.create({
            ...createCompanyDto,
            createdById: user.id,
            createdBy: user,
        });
        const savedCompany = await this.companyRepository.save(company);
        return this.findOneWithRelations(savedCompany.id);
    }
    async findAll(page = 1, limit = 20, search, status, userId) {
        const queryBuilder = this.companyRepository.createQueryBuilder('company')
            .leftJoinAndSelect('company.createdBy', 'createdBy')
            .orderBy('company.createdAt', 'DESC');
        if (search) {
            queryBuilder.andWhere('(company.name ILIKE :search OR company.email ILIKE :search OR company.phone ILIKE :search)', { search: `%${search}%` });
        }
        if (status) {
            queryBuilder.andWhere('company.status = :status', { status });
        }
        if (userId) {
            queryBuilder.andWhere('company.createdById = :userId', { userId });
        }
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
            })),
            total,
            pages,
        };
    }
    async findOne(id) {
        const company = await this.findOneWithRelations(id);
        if (!company) {
            throw new common_1.NotFoundException(`ID'si ${id} olan firma bulunamadı`);
        }
        return company;
    }
    async update(id, updateCompanyDto, user) {
        const company = await this.findOne(id);
        if (company.createdById !== user.id && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Bu firmayı güncelleme yetkiniz yok');
        }
        await this.companyRepository.update(id, updateCompanyDto);
        return this.findOne(id);
    }
    async remove(id, user) {
        const company = await this.findOne(id);
        if (company.createdById !== user.id && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Bu firmayı silme yetkiniz yok');
        }
        await this.companyRepository.update(id, { isActive: false });
    }
    async findOneWithRelations(id) {
        return this.companyRepository.findOne({
            where: { id, isActive: true },
            relations: ['createdBy'],
        });
    }
    async getStats(userId) {
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
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map