import { Repository } from 'typeorm';
import { Contact, ContactStatus, ContactType } from '../entities/contact.entity';
import { Company } from '../entities/company.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
export declare class ContactsService {
    private contactRepository;
    private companyRepository;
    constructor(contactRepository: Repository<Contact>, companyRepository: Repository<Company>);
    create(createContactDto: CreateContactDto, userId: string): Promise<Contact>;
    findAll(page?: number, limit?: number, search?: string, companyId?: string, contactType?: ContactType, status?: ContactStatus, userId?: string): Promise<{
        contacts: Contact[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(userId?: string, companyId?: string): Promise<{
        total: number;
        employees: number;
        managers: number;
        decisionMakers: number;
        active: number;
        inactive: number;
    }>;
    findOne(id: string, userId?: string): Promise<Contact>;
    update(id: string, updateContactDto: UpdateContactDto, userId: string): Promise<Contact>;
    remove(id: string, userId: string): Promise<void>;
    findByCompany(companyId: string, userId?: string): Promise<Contact[]>;
}
