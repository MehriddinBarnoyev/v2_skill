import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The bio of the user', example: 'Software Developer', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'The profile picture of the user', example: 'https://example.com/profile.jpg', required: false })
  @IsOptional()
  @IsString()
  profile_picture?: string;

  @ApiProperty({ description: 'The age of the user', example: 30, required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ description: 'The location of the user', example: 'New York, USA', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'The skills of the user', example: ['JavaScript', 'Python'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'The certificates of the user', example: ['AWS Certified Developer'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificates?: string[];

  @ApiProperty({ description: 'The experience of the user', example: ['Software Engineer at XYZ', 'Intern at ABC'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experience?: string[];

  @ApiProperty({ description: 'The friends of the user', example: ['user1', 'user2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  friends?: string[];

  @ApiProperty({ description: 'The hobbies of the user', example: ['Reading', 'Traveling'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @ApiProperty({ description: 'The isDeleted status of the user', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'The education of the user', example: ['BSc Computer Science'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  sender: string;

  receiver_id: string
}