import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockAdjustmentType } from '@prisma/client';

export class BulkAdjustItemDto {
  @ApiProperty({ example: 'uuid-variant-id' })
  @IsNotEmpty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ enum: StockAdjustmentType, example: StockAdjustmentType.STOCK_IN })
  @IsNotEmpty()
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'Bulk warehouse intake' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'BULK_IMPORT' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ example: 'REF-2026-BATCH1' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class BulkAdjustDto {
  @ApiProperty({ type: [BulkAdjustItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAdjustItemDto)
  items: BulkAdjustItemDto[];
}
