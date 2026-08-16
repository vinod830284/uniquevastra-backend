import { PrismaService } from '../../../database/prisma.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
export declare class CollectionsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(onlyActive?: boolean): Promise<({
        _count: {
            products: number;
        };
    } & {
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
    })[]>;
    findById(id: string): Promise<({
        products: ({
            product: {
                variants: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.VariantStatus;
                    sku: string;
                    size: string;
                    color: string;
                    colorCode: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
                    productId: string;
                }[];
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
        status: import("@prisma/client").$Enums.CollectionStatus;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        sortOrder: number;
        bannerImageUrl: string | null;
        isFeatured: boolean;
        startDate: Date | null;
        endDate: Date | null;
    }) | null>;
    findBySlug(slug: string, onlyActive?: boolean): Promise<({
        products: ({
            product: {
                variants: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.VariantStatus;
                    sku: string;
                    size: string;
                    color: string;
                    colorCode: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
                    productId: string;
                }[];
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
        status: import("@prisma/client").$Enums.CollectionStatus;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        sortOrder: number;
        bannerImageUrl: string | null;
        isFeatured: boolean;
        startDate: Date | null;
        endDate: Date | null;
    }) | null>;
    create(dto: CreateCollectionDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateCollectionDto): Promise<{
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
    }>;
    archive(id: string): Promise<{
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
    }>;
    addProduct(collectionId: string, productId: string, sortOrder?: number): Promise<{
        sortOrder: number;
        productId: string;
        collectionId: string;
        assignedAt: Date;
    }>;
    removeProduct(collectionId: string, productId: string): Promise<{
        sortOrder: number;
        productId: string;
        collectionId: string;
        assignedAt: Date;
    }>;
    reorderProducts(collectionId: string, items: {
        productId: string;
        sortOrder: number;
    }[]): Promise<{
        sortOrder: number;
        productId: string;
        collectionId: string;
        assignedAt: Date;
    }[]>;
}
