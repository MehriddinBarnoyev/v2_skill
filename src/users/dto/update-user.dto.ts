import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Skills cannot be an empty array' })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Education cannot be an empty array' })
  education?: string[];

  @IsOptional()
  @IsArray()
  certificates?: string[];

  @IsOptional()
  @IsString()
  isDeleted?: string; // Note: This should ideally be a boolean, adjust based on your needs
}