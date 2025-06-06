import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactType, ContactStatus } from '../entities/contact.entity';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    create(createContactDto: CreateContactDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/contact.entity").Contact;
    }>;
    findAll(page?: number, limit?: number, search?: string, companyId?: string, contactType?: ContactType, status?: ContactStatus, req?: any): Promise<{
        success: boolean;
        message: string;
        data: {
            contacts: import("../entities/contact.entity").Contact[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getStats(companyId?: string, req?: any): Promise<{
        success: boolean;
        message: string;
        data: {
            total: number;
            employees: number;
            managers: number;
            decisionMakers: number;
            active: number;
            inactive: number;
        };
    }>;
    findByCompany(companyId: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/contact.entity").Contact[];
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/contact.entity").Contact;
    }>;
    update(id: string, updateContactDto: UpdateContactDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/contact.entity").Contact;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
