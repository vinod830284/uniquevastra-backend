import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'uuid-payment-id' })
  @IsNotEmpty()
  @IsUUID()
  paymentId: string;

  @ApiProperty({ example: 'pay_rzp_9988776655' })
  @IsNotEmpty()
  @IsString()
  providerPaymentId: string;

  @ApiProperty({ example: 'order_rzp_1234567890' })
  @IsNotEmpty()
  @IsString()
  providerOrderId: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6g7h8i9j0signature' })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
