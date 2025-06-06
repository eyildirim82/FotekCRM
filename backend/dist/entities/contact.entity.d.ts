import { Company } from './company.entity';
import { User } from './user.entity';
export declare enum ContactType {
    EMPLOYEE = "employee",
    MANAGER = "manager",
    DECISION_MAKER = "decision_maker",
    TECHNICAL = "technical",
    FINANCIAL = "financial",
    OTHER = "other"
}
export declare enum ContactStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    LEFT_COMPANY = "left_company",
    NO_CONTACT = "no_contact"
}
export declare class Contact {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    mobile?: string;
    jobTitle?: string;
    department?: string;
    contactType: ContactType;
    status: ContactStatus;
    isPrimary: boolean;
    isActive: boolean;
    linkedInUrl?: string;
    skype?: string;
    address?: string;
    birthDate?: Date;
    notes?: string;
    companyId: string;
    company: Company;
    createdById: string;
    createdBy: User;
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
    get displayName(): string;
}
