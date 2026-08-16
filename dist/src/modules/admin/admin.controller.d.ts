import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(loginDto: AdminLoginDto): Promise<{
        admin: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.AdminRole;
        };
        accessToken: string;
        tokenType: string;
    }>;
    createAdmin(dto: CreateAdminDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listAdmins(): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
