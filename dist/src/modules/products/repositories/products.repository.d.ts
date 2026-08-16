import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { AddProductImageDto } from '../dto/image-management.dto';
import { Prisma, ProductStatus } from '@prisma/client';
export declare class ProductsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: ProductQueryDto, onlyActive?: boolean): Promise<{
        items: ({
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
            variants: ({
                inventory: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    variantId: string;
                    stock: number;
                    reservedStock: number;
                    lowStockThreshold: number;
                } | null;
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
            })[];
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
            collections: ({
                collection: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.CollectionStatus;
                    slug: string;
                    description: string | null;
                    imageUrl: string | null;
                    sortOrder: number;
                    bannerImageUrl: string | null;
                    isFeatured: boolean;
                    startDate: Date | null;
                    endDate: Date | null;
                };
            } & {
                sortOrder: number;
                productId: string;
                collectionId: string;
                assignedAt: Date;
            })[];
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<({
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
        variants: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                variantId: string;
                stock: number;
                reservedStock: number;
                lowStockThreshold: number;
            } | null;
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
        })[];
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
        collections: ({
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.CollectionStatus;
                slug: string;
                description: string | null;
                imageUrl: string | null;
                sortOrder: number;
                bannerImageUrl: string | null;
                isFeatured: boolean;
                startDate: Date | null;
                endDate: Date | null;
            };
        } & {
            sortOrder: number;
            productId: string;
            collectionId: string;
            assignedAt: Date;
        })[];
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
    }) | null>;
    findBySlug(slug: string, onlyActive?: boolean): Promise<({
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
        variants: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                variantId: string;
                stock: number;
                reservedStock: number;
                lowStockThreshold: number;
            } | null;
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
        })[];
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
        collections: ({
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.CollectionStatus;
                slug: string;
                description: string | null;
                imageUrl: string | null;
                sortOrder: number;
                bannerImageUrl: string | null;
                isFeatured: boolean;
                startDate: Date | null;
                endDate: Date | null;
            };
        } & {
            sortOrder: number;
            productId: string;
            collectionId: string;
            assignedAt: Date;
        })[];
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
    }) | null>;
    findVariantBySku(sku: string): Promise<({
        inventory: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            variantId: string;
            stock: number;
            reservedStock: number;
            lowStockThreshold: number;
        } | null;
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
    }) | null>;
    create(dto: CreateProductDto): Promise<({
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
        variants: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                variantId: string;
                stock: number;
                reservedStock: number;
                lowStockThreshold: number;
            } | null;
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
        })[];
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
        collections: ({
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.CollectionStatus;
                slug: string;
                description: string | null;
                imageUrl: string | null;
                sortOrder: number;
                bannerImageUrl: string | null;
                isFeatured: boolean;
                startDate: Date | null;
                endDate: Date | null;
            };
        } & {
            sortOrder: number;
            productId: string;
            collectionId: string;
            assignedAt: Date;
        })[];
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
    }) | null>;
    update(id: string, dto: UpdateProductDto): Promise<{
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
        variants: ({
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                variantId: string;
                stock: number;
                reservedStock: number;
                lowStockThreshold: number;
            } | null;
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
        })[];
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
        collections: ({
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.CollectionStatus;
                slug: string;
                description: string | null;
                imageUrl: string | null;
                sortOrder: number;
                bannerImageUrl: string | null;
                isFeatured: boolean;
                startDate: Date | null;
                endDate: Date | null;
            };
        } & {
            sortOrder: number;
            productId: string;
            collectionId: string;
            assignedAt: Date;
        })[];
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
    }>;
    setStatus(id: string, status: ProductStatus): Promise<{
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
    }>;
    addVariant(productId: string, dto: CreateVariantDto): Promise<({
        inventory: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            variantId: string;
            stock: number;
            reservedStock: number;
            lowStockThreshold: number;
        } | null;
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
    }) | null>;
    addImage(productId: string, dto: AddProductImageDto): Promise<{
        id: string;
        createdAt: Date;
        sortOrder: number;
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
        isPrimary: boolean;
        variantId: string | null;
        productId: string;
    }>;
    updateImage(imageId: string, dto: Partial<AddProductImageDto>): Promise<{
        id: string;
        createdAt: Date;
        sortOrder: number;
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
        isPrimary: boolean;
        variantId: string | null;
        productId: string;
    }>;
    deleteImage(imageId: string): Promise<{
        id: string;
        createdAt: Date;
        sortOrder: number;
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
        isPrimary: boolean;
        variantId: string | null;
        productId: string;
    }>;
    setPrimaryImage(productId: string, imageId: string): Promise<{
        id: string;
        createdAt: Date;
        sortOrder: number;
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
        isPrimary: boolean;
        variantId: string | null;
        productId: string;
    }>;
    reorderImages(productId: string, items: {
        imageId: string;
        sortOrder: number;
    }[]): Promise<{
        id: string;
        createdAt: Date;
        sortOrder: number;
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
        isPrimary: boolean;
        variantId: string | null;
        productId: string;
    }[]>;
}
