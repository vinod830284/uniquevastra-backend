import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@uniquevastra.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AdminSecretPassword123!' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
