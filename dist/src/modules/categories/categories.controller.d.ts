import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class PublicCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<({
        children: {
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
        }[];
    } & {
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
    })[]>;
    findBySlug(slug: string): Promise<{
        children: {
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
        }[];
        products: ({
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
        })[];
    } & {
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
    }>;
}
export declare class AdminCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<({
        children: {
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
        }[];
    } & {
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
    })[]>;
    findById(id: string): Promise<{
        parent: {
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
        } | null;
        children: {
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
        }[];
        _count: {
            products: number;
        };
    } & {
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
    }>;
    create(dto: CreateCategoryDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
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
    }>;
    archive(id: string): Promise<{
        message: string;
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
    }>;
}
