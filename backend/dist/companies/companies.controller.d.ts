import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    create(createCompanyDto: CreateCompanyDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: Omit<import("../entities/company.entity").Company, "toResponseObject" | "createdBy"> & {
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
            };
        };
    }>;
    findAll(page?: number, limit?: number, search?: string, status?: string, userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            companies: (Omit<import("../entities/company.entity").Company, "toResponseObject" | "createdBy"> & {
                createdBy: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    email: string;
                };
            })[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getStats(userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            total: number;
            leads: number;
            prospects: number;
            customers: number;
            inactive: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: Omit<import("../entities/company.entity").Company, "toResponseObject" | "createdBy"> & {
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
            };
        };
    }>;
    update(id: string, updateCompanyDto: UpdateCompanyDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: Omit<import("../entities/company.entity").Company, "toResponseObject" | "createdBy"> & {
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
            };
        };
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
