import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseStockDto {
  @ApiProperty({ example: 2, description: 'Must be greater than 0' })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Checkout cancelled or expired session' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'ORDER' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ example: 'uuid-order-id' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
