import { Body, Controller, Get, Param, Patch, UseGuards, Query, BadRequestException, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  @ApiOperation({ summary: 'Update current logged-in user’s profile, including profile picture and certificates' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'user123' },
        name: { type: 'string', example: 'John Doe' },
        skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Python'] },
        education: { type: 'string', example: 'Computer Science' },
        isDeleted: { type: 'boolean', example: false },
        profile_picture: { type: 'string', format: 'binary' },
        certificates: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  @ApiResponse({ status: 400, description: 'Invalid file types or invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile_picture', maxCount: 1 },
        { name: 'certificates', maxCount: 10 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname).toLowerCase();
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedImageTypes = ['.jpg', '.jpeg', '.png'];
          const allowedCertTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
          const ext = extname(file.originalname).toLowerCase();
          if (file.fieldname === 'profile_picture' && !allowedImageTypes.includes(ext)) {
            return cb(new BadRequestException('Profile picture must be JPG, JPEG, or PNG'), false);
          }
          if (file.fieldname === 'certificates' && !allowedCertTypes.includes(ext)) {
            return cb(new BadRequestException('Certificates must be PDF, JPG, JPEG, or PNG'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  async updateMe(
    @GetUser() user: User,
    @Body() dto: UpdateUserDto,
    @UploadedFiles()
    files: {
      profile_picture?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    },
  ) {
    console.log('PATCH /users/me called for user:', user._id as string, 'with data:', dto, 'and files:', {
      profile_picture: files.profile_picture?.map(f => f.filename),
      certificates: files.certificates?.map(f => f.filename),
    });

    const profilePicture = files.profile_picture?.[0]?.filename
      ? `http://localhost:3000/uploads/${files.profile_picture[0].filename}`
      : undefined;
    const certificates = files.certificates?.map(file => `http://localhost:3000/uploads/${file.filename}`) || [];

    const updatedUser = await this.usersService.update(user._id as string, dto, profilePicture, certificates);
    return updatedUser;
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