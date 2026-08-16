import { ProductStatus } from '@prisma/client';
export declare class ProductQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    sort?: string;
}
