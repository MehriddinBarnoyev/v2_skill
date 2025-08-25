import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Username of the user', example: 'user123', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Name of the user', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Array of skills', type: [String], example: ['JavaScript', 'Python'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Education of the user', example: 'Computer Science', required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ description: 'Whether the user is deleted', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}