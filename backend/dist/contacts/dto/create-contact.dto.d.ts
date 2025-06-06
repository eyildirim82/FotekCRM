import { ContactType, ContactStatus } from '../../entities/contact.entity';
export declare class CreateContactDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    mobile?: string;
    jobTitle?: string;
    department?: string;
    contactType?: ContactType;
    status?: ContactStatus;
    isPrimary?: boolean;
    isActive?: boolean;
    linkedInUrl?: string;
    skype?: string;
    address?: string;
    birthDate?: string;
    notes?: string;
    companyId: string;
}
