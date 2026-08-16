import { IsArray, IsInt, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddCollectionProductDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class ReorderCollectionProductItem {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  sortOrder: number;
}

export class ReorderCollectionProductsDto {
  @ApiProperty({ type: [ReorderCollectionProductItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderCollectionProductItem)
  items: ReorderCollectionProductItem[];
}
