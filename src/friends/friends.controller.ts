import { Controller, Post, Get, Param, UseGuards, Body } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RespondFriendRequestDto } from './dto/respond-friend.dto';

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) { }

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
  @Post('respond/:requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a friend request (accept or reject)' })
  @ApiParam({ name: 'requestId', description: 'ID of the friend request to respond to', type: String })
  @ApiResponse({ status: 200, description: 'Friend request responded to successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Friend request not found or already processed' })
  respondToRequest(
    @GetUser() user: User,
    @Param('requestId') requestId: string,
    @Body() respondDto: RespondFriendRequestDto
  ) {
    console.log('POST /friends/respond/:requestId called with requestId:', requestId, 'action:', respondDto.action, 'by user:', user._id as string);
    return this.friendsService.respondToRequest(user, requestId, respondDto.action);
  }

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