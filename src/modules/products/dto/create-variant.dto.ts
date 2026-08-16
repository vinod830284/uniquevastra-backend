import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariantStatus } from '@prisma/client';

export class CreateVariantDto {
  @ApiProperty({ example: 'UV-SHADOW-BLK-M' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({ example: 'M' })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({ example: 'Washed Black' })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiPropertyOptional({ example: '#1A1A1A' })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({ example: 1299.0 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 1999.0 })
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 450.0 })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiPropertyOptional({ enum: VariantStatus, default: VariantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;
}
