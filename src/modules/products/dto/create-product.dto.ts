import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { CreateVariantDto } from './create-variant.dto';
import { AddProductImageDto } from './image-management.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Shadow Oversized Graphic Tee' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'shadow-oversized-graphic-tee' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: '240 GSM Heavyweight Streetwear Drop Shoulder Tee' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 'Premium 100% French Terry cotton graphic t-shirt with high density screen print.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'UniqueVastra' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @ApiPropertyOptional({ example: '100% French Terry Cotton' })
  @IsOptional()
  @IsString()
  fabricDetails?: string;

  @ApiPropertyOptional({ example: 'Machine wash cold inside out' })
  @IsOptional()
  @IsString()
  careInstructions?: string;

  @ApiPropertyOptional({ example: 'Oversized' })
  @IsOptional()
  @IsString()
  fit?: string;

  @ApiPropertyOptional({ example: 'Shadow Oversized Tee - UniqueVastra' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Buy Shadow Oversized Tee online at best price.' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ type: [AddProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddProductImageDto)
  images?: AddProductImageDto[];

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];

  @ApiPropertyOptional({ type: [String], example: ['uuid-collection-id-1'] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  collectionIds?: string[];
}
