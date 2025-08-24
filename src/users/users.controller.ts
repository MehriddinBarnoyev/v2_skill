import { Body, Controller, Get, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user’s profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  getMe(@GetUser() user: User) {
    return this.usersService.findById(user._id as string);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current logged-in user’s profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  updateMe(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user._id as string, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by skill, username, name, or education' })
  @ApiQuery({ name: 'skill', required: false, description: 'Skill to search', example: 'JavaScript' })
  @ApiQuery({ name: 'username', required: false, description: 'Username to search', example: 'john_doe' })
  @ApiQuery({ name: 'name', required: false, description: 'Name to search', example: 'John' })
  @ApiQuery({ name: 'education', required: false, description: 'Education to search', example: 'Computer Science' })
  @ApiResponse({ status: 200, description: 'List of matching users' })
  search(
    @Query('skill') skill: string,
    @Query('username') username: string,
    @Query('name') name: string,
    @Query('education') education: string,
  ) {
    return this.usersService.search({ skill, username, name, education });
  }
}