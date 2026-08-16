import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
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
    createAdminUser(dto: CreateAdminDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listAdminUsers(): Promise<{
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
