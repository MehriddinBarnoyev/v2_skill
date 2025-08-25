import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query, BadRequestException, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { Readable } from 'stream';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
  @ApiOperation({ summary: 'Update current logged-in user’s profile (non-file fields)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  async updateMe(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    console.log('PATCH /users/me called for user:', user._id as string, 'with data:', dto);
    return this.usersService.update(user._id as string, dto);
  }

  @Post('me/profile-picture')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile picture for the current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profile_picture: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile picture uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or no file provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  @ApiResponse({ status: 500, description: 'Cloudinary upload failed' })
  @UseInterceptors(
    FileInterceptor('profile_picture', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedImageTypes = [
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.bmp',
          '.webp',
          '.tiff',
          '.svg',
          '.ico',
          '.heif',
          '.heic',
        ];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedImageTypes.includes(ext)) {
          return cb(new BadRequestException('Profile picture must be an image file'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePicture(@GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided. Ensure the file is sent with the field name "profile_picture".');
    }

    try {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `users/${user._id as string}/profile`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload completed but no result returned'));
          },
        );
        Readable.from(file.buffer).pipe(stream);
      });
      const secureUrl = String(result.secure_url);

      const updatedUser = await this.usersService.updateProfilePicture(user._id as string, secureUrl);
      return { message: 'Profile picture uploaded successfully', user: updatedUser };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload profile picture to Cloudinary: ' + error.message);
    }
  }

  @Post('me/certificates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload certificates for the current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        certificates: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Certificates uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file types or no files provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  @ApiResponse({ status: 500, description: 'Cloudinary upload failed' })
  @UseInterceptors(
    FilesInterceptor('certificates', 10, {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedCertTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedCertTypes.includes(ext)) {
          return cb(new BadRequestException('Certificates must be PDF, JPG, JPEG, or PNG'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCertificates(@GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    try {
      const certificateUrls = await Promise.all(
        files.map(file =>
          new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: `users/${user._id as string}/certificates`,
                resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
              },
              (error, result) => {
                if (error) reject(error);
                else if (result) resolve(result.secure_url);
                else reject(new Error('Upload completed but no result returned'));
              },
            );
            Readable.from(file.buffer).pipe(stream);
          }),
        ),
      );

      const updatedUser = await this.usersService.updateCertificates(user._id as string, certificateUrls);
      return { message: 'Certificates uploaded successfully', user: updatedUser };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload certificates to Cloudinary');
    }
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

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 404, description: 'User not found or deleted' })
  getById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.findById(id);
  }
}