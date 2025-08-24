import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('request/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a friend request to a user' })
  @ApiParam({ name: 'userId', description: 'ID of the user to send request to', type: String })
  @ApiResponse({ status: 201, description: 'Friend request sent' })
  @ApiResponse({ status: 400, description: 'Invalid request or already sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Receiver not found or deleted' })
  sendRequest(@GetUser() user: User, @Param('userId') userId: string) {
    return this.friendsService.sendRequest(user, userId);
  }

  // @Post('accept/:requestId')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Accept a friend request' })
  // @ApiParam({ name: 'requestId', description: 'ID of the friend request', type: String })
  // @ApiResponse({ status: 200, description: 'Friend request accepted' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 404, description: 'Request not found or not pending' })
  // acceptRequest(@GetUser() user: User, @Param('requestId') requestId: string) {
  //   return this.friendsService.acceptRequest(user, requestId);
  // }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user’s friends and pending requests' })
  @ApiResponse({ status: 200, description: 'List of friends and pending requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFriendsAndRequests(@GetUser() user: User) {
    return this.friendsService.getFriendsAndRequests(user);
  }
}