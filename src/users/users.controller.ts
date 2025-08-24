import { Body, Controller, Get, Param, Patch, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Types } from 'mongoose';

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
    console.log('GET /users/me called for user:', user._id as string);
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
    console.log('PATCH /users/me called for user:', user._id as string, 'with data:', dto);
    return this.usersService.update(user._id as string, dto);
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
    console.log('GET /users/search called with query:', { skill, username, name, education });
    return this.usersService.search({ skill, username, name, education });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  getById(@Param('id') id: string) {
    console.log('GET /users/:id called with id:', id);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.findById(id);
  }
}