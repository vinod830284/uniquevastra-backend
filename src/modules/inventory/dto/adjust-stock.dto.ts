import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockAdjustmentType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({
    enum: [StockAdjustmentType.STOCK_IN, StockAdjustmentType.STOCK_OUT, StockAdjustmentType.CORRECTION, StockAdjustmentType.DAMAGE],
    example: StockAdjustmentType.STOCK_IN,
  })
  @IsNotEmpty()
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @ApiProperty({ example: 10, description: 'Must be greater than 0' })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({ example: 'Received fresh shipment from manufacturer' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'PURCHASE_ORDER' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ example: 'PO-2026-001' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
