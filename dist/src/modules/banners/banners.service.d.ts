import { OnModuleInit } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../../database/prisma.service';
export declare class BannersService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAllActive(position?: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        title: string;
        subtitle: string | null;
        image: string;
        badge: string | null;
        buttonText: string;
        position: string;
        actionType: string;
        actionId: string | null;
    }[]>;
    findAllAdmin(position?: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        title: string;
        subtitle: string | null;
        image: string;
        badge: string | null;
        buttonText: string;
        position: string;
        actionType: string;
        actionId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        title: string;
        subtitle: string | null;
        image: string;
        badge: string | null;
        buttonText: string;
        position: string;
        actionType: string;
        actionId: string | null;
    }>;
    create(createBannerDto: CreateBannerDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        title: string;
        subtitle: string | null;
        image: string;
        badge: string | null;
        buttonText: string;
        position: string;
        actionType: string;
        actionId: string | null;
    }>;
    update(id: string, updateBannerDto: UpdateBannerDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        title: string;
        subtitle: string | null;
        image: string;
        badge: string | null;
        buttonText: string;
        position: string;
        actionType: string;
        actionId: string | null;
    }>;
    reorderBanners(items: {
        id: string;
        sortOrder: number;
    }[]): Promise<{
        success: boolean;
        message: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        title: string;
        subtitle: string | null;
        image: string;
        badge: string | null;
        buttonText: string;
        position: string;
        actionType: string;
        actionId: string | null;
    }>;
}
