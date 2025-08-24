import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'User password', example: 'strongpassword' })
  @IsString()
  @MinLength(6)
  password: string;
}