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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_entity_1 = require("../entities/contact.entity");
const company_entity_1 = require("../entities/company.entity");
let ContactsService = class ContactsService {
    constructor(contactRepository, companyRepository) {
        this.contactRepository = contactRepository;
        this.companyRepository = companyRepository;
    }
    async create(createContactDto, userId) {
        const company = await this.companyRepository.findOne({
            where: { id: createContactDto.companyId }
        });
        if (!company) {
            throw new common_1.NotFoundException('Firma bulunamadı');
        }
        if (createContactDto.isPrimary) {
            await this.contactRepository.update({ companyId: createContactDto.companyId }, { isPrimary: false });
        }
        let birthDate;
        if (createContactDto.birthDate) {
            birthDate = new Date(createContactDto.birthDate);
            if (isNaN(birthDate.getTime())) {
                throw new common_1.BadRequestException('Geçersiz doğum tarihi formatı');
            }
        }
        const contact = this.contactRepository.create({
            ...createContactDto,
            birthDate,
            createdById: userId
        });
        return this.contactRepository.save(contact);
    }
    async findAll(page = 1, limit = 10, search, companyId, contactType, status, userId) {
        const skip = (page - 1) * limit;
        let queryBuilder = this.contactRepository
            .createQueryBuilder('contact')
            .leftJoinAndSelect('contact.company', 'company')
            .leftJoinAndSelect('contact.createdBy', 'createdBy');
        if (search) {
            queryBuilder = queryBuilder.where('(contact.firstName LIKE :search OR contact.lastName LIKE :search OR contact.email LIKE :search OR contact.jobTitle LIKE :search)', { search: `%${search}%` });
        }
        if (companyId) {
            queryBuilder = queryBuilder.andWhere('contact.companyId = :companyId', { companyId });
        }
        if (contactType) {
            queryBuilder = queryBuilder.andWhere('contact.contactType = :contactType', { contactType });
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('contact.status = :status', { status });
        }
        if (userId) {
            queryBuilder = queryBuilder.andWhere('(contact.createdById = :userId OR company.createdById = :userId)', { userId });
        }
        const [contacts, total] = await queryBuilder
            .orderBy('contact.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getStats(userId, companyId) {
        let queryBuilder = this.contactRepository
            .createQueryBuilder('contact')
            .leftJoin('contact.company', 'company');
        if (userId) {
            queryBuilder = queryBuilder.where('(contact.createdById = :userId OR company.createdById = :userId)', { userId });
        }
        if (companyId) {
            queryBuilder = queryBuilder.andWhere('contact.companyId = :companyId', { companyId });
        }
        const total = await queryBuilder.getCount();
        const employees = await queryBuilder
            .andWhere('contact.contactType = :type', { type: contact_entity_1.ContactType.EMPLOYEE })
            .getCount();
        const managers = await queryBuilder
            .andWhere('contact.contactType = :type', { type: contact_entity_1.ContactType.MANAGER })
            .getCount();
        const decisionMakers = await queryBuilder
            .andWhere('contact.contactType = :type', { type: contact_entity_1.ContactType.DECISION_MAKER })
            .getCount();
        const active = await this.contactRepository
            .createQueryBuilder('contact')
            .leftJoin('contact.company', 'company')
            .where(userId ? '(contact.createdById = :userId OR company.createdById = :userId)' : '1=1', { userId })
            .andWhere(companyId ? 'contact.companyId = :companyId' : '1=1', { companyId })
            .andWhere('contact.status = :status', { status: contact_entity_1.ContactStatus.ACTIVE })
            .getCount();
        return {
            total,
            employees,
            managers,
            decisionMakers,
            active,
            inactive: total - active
        };
    }
    async findOne(id, userId) {
        let queryBuilder = this.contactRepository
            .createQueryBuilder('contact')
            .leftJoinAndSelect('contact.company', 'company')
            .leftJoinAndSelect('contact.createdBy', 'createdBy')
            .where('contact.id = :id', { id });
        if (userId) {
            queryBuilder = queryBuilder.andWhere('(contact.createdById = :userId OR company.createdById = :userId)', { userId });
        }
        const contact = await queryBuilder.getOne();
        if (!contact) {
            throw new common_1.NotFoundException('Kişi bulunamadı');
        }
        return contact;
    }
    async update(id, updateContactDto, userId) {
        const contact = await this.findOne(id, userId);
        if (updateContactDto.companyId && updateContactDto.companyId !== contact.companyId) {
            const company = await this.companyRepository.findOne({
                where: { id: updateContactDto.companyId }
            });
            if (!company) {
                throw new common_1.NotFoundException('Firma bulunamadı');
            }
        }
        if (updateContactDto.isPrimary && !contact.isPrimary) {
            const companyId = updateContactDto.companyId || contact.companyId;
            await this.contactRepository.update({ companyId, id: (0, typeorm_2.Not)(id) }, { isPrimary: false });
        }
        if (updateContactDto.birthDate) {
            const birthDate = new Date(updateContactDto.birthDate);
            if (isNaN(birthDate.getTime())) {
                throw new common_1.BadRequestException('Geçersiz doğum tarihi formatı');
            }
            updateContactDto.birthDate = birthDate;
        }
        await this.contactRepository.update(id, updateContactDto);
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        const contact = await this.findOne(id, userId);
        await this.contactRepository.update(id, {
            status: contact_entity_1.ContactStatus.INACTIVE,
            isActive: false
        });
    }
    async findByCompany(companyId, userId) {
        let queryBuilder = this.contactRepository
            .createQueryBuilder('contact')
            .leftJoinAndSelect('contact.company', 'company')
            .leftJoinAndSelect('contact.createdBy', 'createdBy')
            .where('contact.companyId = :companyId', { companyId });
        if (userId) {
            queryBuilder = queryBuilder.andWhere('(contact.createdById = :userId OR company.createdById = :userId)', { userId });
        }
        return queryBuilder
            .orderBy('contact.isPrimary', 'DESC')
            .addOrderBy('contact.createdAt', 'DESC')
            .getMany();
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map