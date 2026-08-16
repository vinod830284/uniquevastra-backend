import { VariantStatus } from '@prisma/client';
export declare class CreateVariantDto {
    sku: string;
    size: string;
    color: string;
    colorCode?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    status?: VariantStatus;
}
