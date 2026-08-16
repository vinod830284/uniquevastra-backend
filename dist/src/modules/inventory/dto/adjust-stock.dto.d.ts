import { StockAdjustmentType } from '@prisma/client';
export declare class AdjustStockDto {
    type: StockAdjustmentType;
    quantity: number;
    reason: string;
    referenceType?: string;
    referenceId?: string;
}
