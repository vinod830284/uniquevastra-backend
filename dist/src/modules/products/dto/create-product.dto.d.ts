import { ProductStatus } from '@prisma/client';
import { CreateVariantDto } from './create-variant.dto';
import { AddProductImageDto } from './image-management.dto';
export declare class CreateProductDto {
    name: string;
    slug: string;
    shortDescription?: string;
    description: string;
    brand?: string;
    categoryId: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    fabricDetails?: string;
    careInstructions?: string;
    fit?: string;
    seoTitle?: string;
    seoDescription?: string;
    images?: AddProductImageDto[];
    variants: CreateVariantDto[];
    collectionIds?: string[];
}
