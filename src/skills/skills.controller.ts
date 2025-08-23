import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/schemas/user.schema';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
    constructor(private skillsService: SkillsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a new skill' })
    @ApiResponse({ status: 201, description: 'Skill added' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@GetUser() user: User, @Body() dto: CreateSkillDto) {
        return this.skillsService.create(user.id.toString(), dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all skills of the logged-in user' })
    @ApiResponse({ status: 200, description: 'List of skills' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findAll(@GetUser() user: User) {
        return this.skillsService.findByUser(user.id.toString());
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a skill' })
    @ApiParam({ name: 'id', description: 'Skill ID', type: String })
    @ApiResponse({ status: 200, description: 'Updated skill' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Not authorized' })
    @ApiResponse({ status: 404, description: 'Skill not found' })
    update(@Param('id') id: string, @Body() dto: UpdateSkillDto, @GetUser() user: User) {
        return this.skillsService.update(id, dto, user.id.toString());
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a skill' })
    @ApiParam({ name: 'id', description: 'Skill ID', type: String })
    @ApiResponse({ status: 200, description: 'Skill deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Not authorized' })
    @ApiResponse({ status: 404, description: 'Skill not found' })
    remove(@Param('id') id: string, @GetUser() user: User) {
        return this.skillsService.delete(id, user.id.toString());
    }
}