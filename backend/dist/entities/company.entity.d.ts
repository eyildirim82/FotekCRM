import { User } from './user.entity';
export declare class Company {
    id: string;
    name: string;
    taxNumber: string;
    industry: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    notes: string;
    isActive: boolean;
    status: 'lead' | 'prospect' | 'customer' | 'inactive';
    createdBy: User;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    toResponseObject(): Omit<this, "toResponseObject" | "createdBy"> & {
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
}
