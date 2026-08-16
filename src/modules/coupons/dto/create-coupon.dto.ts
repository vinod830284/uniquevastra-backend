import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE })
  @IsNotEmpty()
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10, description: 'Percentage discount (1-100) or fixed amount in Rupees' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 499, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderValue?: number = 0;

  @ApiPropertyOptional({ example: 200, description: 'Max discount cap in Rupees for PERCENTAGE type' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscount?: number;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 1000, description: 'Total global usage limit' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Per user usage limit' })
  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number = 1;
}
