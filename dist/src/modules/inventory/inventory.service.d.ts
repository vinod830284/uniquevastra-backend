import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { BulkAdjustDto } from './dto/bulk-adjust.dto';
import { InventoryStatus } from '@prisma/client';
export declare class InventoryService {
    private repository;
    private transactionService;
    constructor(repository: InventoryRepository, transactionService: InventoryTransactionService);
    static calculateStatus(stock: number, reservedStock: number, lowStockThreshold: number): InventoryStatus;
    getSummary(): Promise<{
        totalVariants: number;
        totalUnits: number;
        lowStockVariants: number;
        outOfStockVariants: number;
    }>;
    findAllAdmin(query: InventoryQueryDto): Promise<{
        items: {
            id: string;
            variantId: string;
            sku: string;
            size: string;
            color: string;
            productName: string;
            categoryName: string;
            productImage: string;
            costPrice: number | null;
            sellingPrice: number;
            stock: number;
            reservedStock: number;
            availableStock: number;
            lowStockThreshold: number;
            status: import("@prisma/client").$Enums.InventoryStatus;
            updatedAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getLowStock(query: InventoryQueryDto): Promise<{
        items: {
            id: string;
            variantId: string;
            sku: string;
            size: string;
            color: string;
            productName: string;
            categoryName: string;
            productImage: string;
            costPrice: number | null;
            sellingPrice: number;
            stock: number;
            reservedStock: number;
            availableStock: number;
            lowStockThreshold: number;
            status: import("@prisma/client").$Enums.InventoryStatus;
            updatedAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getOutOfStock(query: InventoryQueryDto): Promise<{
        items: {
            id: string;
            variantId: string;
            sku: string;
            size: string;
            color: string;
            productName: string;
            categoryName: string;
            productImage: string;
            costPrice: number | null;
            sellingPrice: number;
            stock: number;
            reservedStock: number;
            availableStock: number;
            lowStockThreshold: number;
            status: import("@prisma/client").$Enums.InventoryStatus;
            updatedAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findByVariantId(variantId: string): Promise<{
        availableStock: number;
        status: import("@prisma/client").$Enums.InventoryStatus;
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
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            productId: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    adjustStock(variantId: string, dto: AdjustStockDto, adminUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    reserveStock(variantId: string, quantity: number, reason: string, adminUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    releaseStock(variantId: string, quantity: number, reason: string, adminUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    getHistory(variantId: string): Promise<{
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
    updateThreshold(variantId: string, threshold: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    bulkAdjust(dto: BulkAdjustDto, adminUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }[]>;
}
