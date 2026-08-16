import { InventoryStatus } from '@prisma/client';
export declare class InventoryQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sku?: string;
    category?: string;
    size?: string;
    color?: string;
    status?: InventoryStatus;
    lowStock?: boolean;
    outOfStock?: boolean;
}
