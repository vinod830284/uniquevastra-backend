import { PrismaService } from '../../../database/prisma.service';
import { InventoryQueryDto } from '../dto/inventory-query.dto';
import { Prisma } from '@prisma/client';
export declare class InventoryRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findByVariantId(variantId: string): Promise<({
        variant: {
            images: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                url: string;
                thumbnailUrl: string | null;
                altText: string | null;
                isPrimary: boolean;
                variantId: string | null;
                productId: string;
            }[];
            product: {
                category: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.CategoryStatus;
                    slug: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    sortOrder: number;
                };
                images: {
                    id: string;
                    createdAt: Date;
                    sortOrder: number;
                    url: string;
                    thumbnailUrl: string | null;
                    altText: string | null;
                    isPrimary: boolean;
                    variantId: string | null;
                    productId: string;
                }[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ProductStatus;
                slug: string;
                description: string;
                isFeatured: boolean;
                shortDescription: string | null;
                brand: string;
                categoryId: string;
                isNewArrival: boolean;
                isBestSeller: boolean;
                fabricDetails: string | null;
                careInstructions: string | null;
                fit: string | null;
                seoTitle: string | null;
                seoDescription: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.VariantStatus;
            sku: string;
            size: string;
            color: string;
            colorCode: string | null;
            price: Prisma.Decimal;
            compareAtPrice: Prisma.Decimal | null;
            costPrice: Prisma.Decimal | null;
            productId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }) | null>;
    findById(id: string): Promise<({
        variant: {
            product: {
                category: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.CategoryStatus;
                    slug: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    sortOrder: number;
                };
                images: {
                    id: string;
                    createdAt: Date;
                    sortOrder: number;
                    url: string;
                    thumbnailUrl: string | null;
                    altText: string | null;
                    isPrimary: boolean;
                    variantId: string | null;
                    productId: string;
                }[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ProductStatus;
                slug: string;
                description: string;
                isFeatured: boolean;
                shortDescription: string | null;
                brand: string;
                categoryId: string;
                isNewArrival: boolean;
                isBestSeller: boolean;
                fabricDetails: string | null;
                careInstructions: string | null;
                fit: string | null;
                seoTitle: string | null;
                seoDescription: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.VariantStatus;
            sku: string;
            size: string;
            color: string;
            colorCode: string | null;
            price: Prisma.Decimal;
            compareAtPrice: Prisma.Decimal | null;
            costPrice: Prisma.Decimal | null;
            productId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }) | null>;
    findAll(query: InventoryQueryDto): Promise<{
        items: ({
            variant: {
                images: {
                    id: string;
                    createdAt: Date;
                    sortOrder: number;
                    url: string;
                    thumbnailUrl: string | null;
                    altText: string | null;
                    isPrimary: boolean;
                    variantId: string | null;
                    productId: string;
                }[];
                product: {
                    category: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
                        status: import("@prisma/client").$Enums.CategoryStatus;
                        slug: string;
                        description: string | null;
                        imageUrl: string | null;
                        parentId: string | null;
                        sortOrder: number;
                    };
                    images: {
                        id: string;
                        createdAt: Date;
                        sortOrder: number;
                        url: string;
                        thumbnailUrl: string | null;
                        altText: string | null;
                        isPrimary: boolean;
                        variantId: string | null;
                        productId: string;
                    }[];
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.ProductStatus;
                    slug: string;
                    description: string;
                    isFeatured: boolean;
                    shortDescription: string | null;
                    brand: string;
                    categoryId: string;
                    isNewArrival: boolean;
                    isBestSeller: boolean;
                    fabricDetails: string | null;
                    careInstructions: string | null;
                    fit: string | null;
                    seoTitle: string | null;
                    seoDescription: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.VariantStatus;
                sku: string;
                size: string;
                color: string;
                colorCode: string | null;
                price: Prisma.Decimal;
                compareAtPrice: Prisma.Decimal | null;
                costPrice: Prisma.Decimal | null;
                productId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            variantId: string;
            stock: number;
            reservedStock: number;
            lowStockThreshold: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getHistory(inventoryId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.StockAdjustmentType;
        quantity: number;
        previousStock: number;
        newStock: number;
        reason: string;
        referenceType: string | null;
        referenceId: string | null;
        createdBy: string | null;
        inventoryId: string;
    }[]>;
    updateThreshold(id: string, lowStockThreshold: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
}
