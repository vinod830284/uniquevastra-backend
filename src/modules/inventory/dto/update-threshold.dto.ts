import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateThresholdDto {
  @ApiProperty({ example: 5, description: 'Must be greater than or equal to 0' })
  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'Low stock threshold must be greater than or equal to 0' })
  threshold: number;
}
