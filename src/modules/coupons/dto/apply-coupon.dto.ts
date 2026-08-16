import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
