import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ example: 'uuid-product-variant-id' })
  @IsNotEmpty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 2, default: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
