import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddProductImageDto {
  @ApiProperty({ example: 'https://example.com/images/front.jpg' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/thumb_front.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Front view of Shadow Tee' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'uuid-variant-id' })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class UpdateProductImageDto {
  @ApiPropertyOptional({ example: 'https://example.com/images/front.jpg' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/thumb_front.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Front view of Shadow Tee' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'uuid-variant-id' })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class ReorderProductImageItem {
  @ApiProperty({ example: 'uuid-image-id' })
  @IsNotEmpty()
  @IsUUID()
  imageId: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  sortOrder: number;
}

export class ReorderProductImagesDto {
  @ApiProperty({ type: [ReorderProductImageItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderProductImageItem)
  items: ReorderProductImageItem[];
}
