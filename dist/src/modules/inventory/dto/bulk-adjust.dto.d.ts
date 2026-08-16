import { StockAdjustmentType } from '@prisma/client';
export declare class BulkAdjustItemDto {
    variantId: string;
    type: StockAdjustmentType;
    quantity: number;
    reason: string;
    referenceType?: string;
    referenceId?: string;
}
export declare class BulkAdjustDto {
    items: BulkAdjustItemDto[];
}
