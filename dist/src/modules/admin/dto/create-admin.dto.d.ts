import { AdminRole } from '@prisma/client';
export declare class CreateAdminDto {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: AdminRole;
}
