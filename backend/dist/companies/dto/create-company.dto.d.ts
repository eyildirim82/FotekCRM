export declare class CreateCompanyDto {
    name: string;
    taxNumber?: string;
    industry?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    notes?: string;
    isActive?: boolean;
    status?: 'lead' | 'prospect' | 'customer' | 'inactive';
}
