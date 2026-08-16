import { PrismaService } from '../../database/prisma.service';
import { StockAdjustmentType } from '@prisma/client';
export interface StockOperationOptions {
    variantId: string;
    quantity: number;
    reason: string;
    createdBy?: string;
    referenceType?: string;
    referenceId?: string;
}
export declare class InventoryTransactionService {
    private prisma;
    constructor(prisma: PrismaService);
    increaseStock(opts: StockOperationOptions, type?: StockAdjustmentType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    decreaseStock(opts: StockOperationOptions, type?: StockAdjustmentType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    reserveStock(opts: StockOperationOptions): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    releaseStock(opts: StockOperationOptions): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }>;
    bulkAdjust(items: StockOperationOptions[], createdBy?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        stock: number;
        reservedStock: number;
        lowStockThreshold: number;
    }[]>;
}
