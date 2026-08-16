import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-saved-address-id' })
  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.COD, example: PaymentMethod.COD })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'Please leave parcel at the front security gate' })
  @IsOptional()
  @IsString()
  notes?: string;
}
