import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSkillDto {
    @ApiProperty({ description: 'Name of the skill', example: 'JavaScript' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Description of the skill', example: 'Expert in JavaScript and TypeScript' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Proficiency level of the skill', example: 'Advanced' })
    @IsOptional()
    @IsString()
    level?: string;
}