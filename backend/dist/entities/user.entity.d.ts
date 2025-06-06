export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    toResponseObject(): Omit<this, "password" | "hashPassword" | "validatePassword" | "toResponseObject">;
}
