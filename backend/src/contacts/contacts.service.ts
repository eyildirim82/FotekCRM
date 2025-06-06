import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, FindOptionsWhere, Not } from 'typeorm'
import { Contact, ContactStatus, ContactType } from '../entities/contact.entity'
import { Company } from '../entities/company.entity'
import { CreateContactDto } from './dto/create-contact.dto'
import { UpdateContactDto } from './dto/update-contact.dto'

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>
  ) {}

  // Create new contact
  async create(createContactDto: CreateContactDto, userId: string): Promise<Contact> {
    // Check if company exists and user has access
    const company = await this.companyRepository.findOne({
      where: { id: createContactDto.companyId }
    })

    if (!company) {
      throw new NotFoundException('Firma bulunamadı')
    }

    // Check if this will be primary contact
    if (createContactDto.isPrimary) {
      // Remove primary flag from other contacts of the same company
      await this.contactRepository.update(
        { companyId: createContactDto.companyId },
        { isPrimary: false }
      )
    }

    // Parse birth date if provided
    let birthDate: Date | undefined
    if (createContactDto.birthDate) {
      birthDate = new Date(createContactDto.birthDate)
      if (isNaN(birthDate.getTime())) {
        throw new BadRequestException('Geçersiz doğum tarihi formatı')
      }
    }

    const contact = this.contactRepository.create({
      ...createContactDto,
      birthDate,
      createdById: userId
    })

    return this.contactRepository.save(contact)
  }

  // Get all contacts with pagination and filters
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    companyId?: string,
    contactType?: ContactType,
    status?: ContactStatus,
    userId?: string
  ) {
    const skip = (page - 1) * limit
    
    // Use query builder for complex search
    let queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.company', 'company')
      .leftJoinAndSelect('contact.createdBy', 'createdBy')

    if (search) {
      queryBuilder = queryBuilder.where(
        '(contact.firstName LIKE :search OR contact.lastName LIKE :search OR contact.email LIKE :search OR contact.jobTitle LIKE :search)',
        { search: `%${search}%` }
      )
    }

    if (companyId) {
      queryBuilder = queryBuilder.andWhere('contact.companyId = :companyId', { companyId })
    }

    if (contactType) {
      queryBuilder = queryBuilder.andWhere('contact.contactType = :contactType', { contactType })
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('contact.status = :status', { status })
    }

    // Permission check: users can only see their own contacts or contacts from their companies
    if (userId) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.createdById = :userId OR company.createdById = :userId)',
        { userId }
      )
    }

    const [contacts, total] = await queryBuilder
      .orderBy('contact.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Get contact statistics
  async getStats(userId?: string, companyId?: string) {
    let queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoin('contact.company', 'company')

    if (userId) {
      queryBuilder = queryBuilder.where(
        '(contact.createdById = :userId OR company.createdById = :userId)',
        { userId }
      )
    }

    if (companyId) {
      queryBuilder = queryBuilder.andWhere('contact.companyId = :companyId', { companyId })
    }

    const total = await queryBuilder.getCount()

    const employees = await queryBuilder
      .andWhere('contact.contactType = :type', { type: ContactType.EMPLOYEE })
      .getCount()

    const managers = await queryBuilder
      .andWhere('contact.contactType = :type', { type: ContactType.MANAGER })
      .getCount()

    const decisionMakers = await queryBuilder
      .andWhere('contact.contactType = :type', { type: ContactType.DECISION_MAKER })
      .getCount()

    const active = await this.contactRepository
      .createQueryBuilder('contact')
      .leftJoin('contact.company', 'company')
      .where(userId ? '(contact.createdById = :userId OR company.createdById = :userId)' : '1=1', { userId })
      .andWhere(companyId ? 'contact.companyId = :companyId' : '1=1', { companyId })
      .andWhere('contact.status = :status', { status: ContactStatus.ACTIVE })
      .getCount()

    return {
      total,
      employees,
      managers,
      decisionMakers,
      active,
      inactive: total - active
    }
  }

  // Get single contact by ID
  async findOne(id: string, userId?: string): Promise<Contact> {
    let queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.company', 'company')
      .leftJoinAndSelect('contact.createdBy', 'createdBy')
      .where('contact.id = :id', { id })

    if (userId) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.createdById = :userId OR company.createdById = :userId)',
        { userId }
      )
    }

    const contact = await queryBuilder.getOne()

    if (!contact) {
      throw new NotFoundException('Kişi bulunamadı')
    }

    return contact
  }

  // Update contact
  async update(id: string, updateContactDto: UpdateContactDto, userId: string): Promise<Contact> {
    const contact = await this.findOne(id, userId)

    // Check if company exists if changing company
    if (updateContactDto.companyId && updateContactDto.companyId !== contact.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: updateContactDto.companyId }
      })

      if (!company) {
        throw new NotFoundException('Firma bulunamadı')
      }
    }

    // Handle primary contact flag
    if (updateContactDto.isPrimary && !contact.isPrimary) {
      // Remove primary flag from other contacts of the same company
      const companyId = updateContactDto.companyId || contact.companyId
      await this.contactRepository.update(
        { companyId, id: Not(id) },
        { isPrimary: false }
      )
    }

    // Parse birth date if provided
    if (updateContactDto.birthDate) {
      const birthDate = new Date(updateContactDto.birthDate)
      if (isNaN(birthDate.getTime())) {
        throw new BadRequestException('Geçersiz doğum tarihi formatı')
      }
      (updateContactDto as any).birthDate = birthDate
    }

    await this.contactRepository.update(id, updateContactDto)
    return this.findOne(id, userId)
  }

  // Soft delete contact
  async remove(id: string, userId: string): Promise<void> {
    const contact = await this.findOne(id, userId)

    // Set status to inactive instead of deleting
    await this.contactRepository.update(id, { 
      status: ContactStatus.INACTIVE,
      isActive: false
    })
  }

  // Get contacts by company
  async findByCompany(companyId: string, userId?: string): Promise<Contact[]> {
    let queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.company', 'company')
      .leftJoinAndSelect('contact.createdBy', 'createdBy')
      .where('contact.companyId = :companyId', { companyId })

    if (userId) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.createdById = :userId OR company.createdById = :userId)',
        { userId }
      )
    }

    return queryBuilder
      .orderBy('contact.isPrimary', 'DESC')
      .addOrderBy('contact.createdAt', 'DESC')
      .getMany()
  }
} 