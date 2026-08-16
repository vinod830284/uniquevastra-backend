import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
export declare class BannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    getActiveBanners(position?: string): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    getAllAdminBanners(position?: string): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    reorderBanners(items: {
        id: string;
        sortOrder: number;
    }[]): Promise<{
        success: boolean;
        message: string;
    }>;
    getBannerById(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    createBanner(createBannerDto: CreateBannerDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    updateBanner(id: string, updateBannerDto: UpdateBannerDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    removeBanner(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
