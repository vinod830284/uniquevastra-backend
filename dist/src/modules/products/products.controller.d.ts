import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { AddProductImageDto, ReorderProductImagesDto } from './dto/image-management.dto';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        items: import("./dto/product-response.dto").PublicProductResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<import("./dto/product-response.dto").PublicProductResponseDto>;
}
export declare class AdminProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        items: import("./dto/product-response.dto").AdminProductResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<import("./dto/product-response.dto").AdminProductResponseDto>;
    create(dto: CreateProductDto): Promise<import("./dto/product-response.dto").AdminProductResponseDto>;
    update(id: string, dto: UpdateProductDto): Promise<import("./dto/product-response.dto").AdminProductResponseDto>;
    publish(id: string): Promise<{
        message: string;
        status: import("@prisma/client").$Enums.ProductStatus;
    }>;
    archive(id: string): Promise<{
        message: string;
        status: import("@prisma/client").$Enums.ProductStatus;
    }>;
    duplicate(id: string): Promise<import("./dto/product-response.dto").AdminProductResponseDto>;
    addVariant(id: string, dto: CreateVariantDto): Promise<({
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
    addImage(id: string, dto: AddProductImageDto): Promise<{
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
    deleteImage(id: string, imageId: string): Promise<{
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
    reorderImages(id: string, dto: ReorderProductImagesDto): Promise<{
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
    setPrimaryImage(id: string, imageId: string): Promise<{
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
