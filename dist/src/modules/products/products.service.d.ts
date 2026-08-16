import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { AddProductImageDto, ReorderProductImagesDto } from './dto/image-management.dto';
import { PublicProductResponseDto, AdminProductResponseDto } from './dto/product-response.dto';
export declare class ProductsService {
    private repository;
    constructor(repository: ProductsRepository);
    findAllPublic(query: ProductQueryDto): Promise<{
        items: PublicProductResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findAllAdmin(query: ProductQueryDto): Promise<{
        items: AdminProductResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findBySlugPublic(slug: string): Promise<PublicProductResponseDto>;
    findByIdAdmin(id: string): Promise<AdminProductResponseDto>;
    create(dto: CreateProductDto): Promise<AdminProductResponseDto>;
    update(id: string, dto: UpdateProductDto): Promise<AdminProductResponseDto>;
    publish(id: string): Promise<{
        message: string;
        status: import("@prisma/client").$Enums.ProductStatus;
    }>;
    archive(id: string): Promise<{
        message: string;
        status: import("@prisma/client").$Enums.ProductStatus;
    }>;
    duplicate(id: string): Promise<AdminProductResponseDto>;
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
        price: import("@prisma/client/runtime/library").Decimal;
        compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
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
    deleteImage(productId: string, imageId: string): Promise<{
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
    reorderImages(productId: string, dto: ReorderProductImagesDto): Promise<{
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
}
