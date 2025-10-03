import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FriendRequest } from './schemas/friend-request.schema';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class FriendsService {
    constructor(
        @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
        private usersService: UsersService,
    ) { }

    async sendRequest(sender: UserDocument, receiverId: string) {
        if (!sender._id) throw new BadRequestException('Invalid sender');
        if (sender._id.toString() === receiverId) {
            throw new BadRequestException('Cannot send friend request to yourself');
        }

        const receiver = await this.usersService.findById(receiverId);
        if (!receiver) throw new NotFoundException('Receiver not found or deleted');

        const existingRequest = await this.friendRequestModel.findOne({
            sender: sender._id,
            receiver: receiver._id,
            status: 'pending',
        });
        if (existingRequest) throw new BadRequestException('Friend request already sent');

        console.log('Creating friend request from sender:', sender._id.toString(), 'to receiver:', receiverId);

        const newRequest = await this.friendRequestModel.create({
            sender: sender._id,
            receiver: receiver._id,
            senderUsername: sender.username,
            senderProfilePicture: sender.profile_picture,
            sendDate: new Date(),
            status: 'pending',
        }) as FriendRequest;

        console.log('Created friend request:', newRequest);

        return newRequest;
    }

    async respondToRequest(user: UserDocument, requestId: string, action: 'accept' | 'reject') {
        if (!user._id) throw new BadRequestException('Invalid user');

        console.log('Responding to friend request:', {
            requestId,
            receiverId: user._id.toString(),
            action,
        });

        // Ensure requestId is a valid ObjectId
        if (!Types.ObjectId.isValid(requestId)) {
            throw new BadRequestException('Invalid friend request ID');
        }

        const friendRequest = await this.friendRequestModel.findOne({
            _id: new Types.ObjectId(requestId),
            receiver: user._id,
            status: 'pending',
        });

        // Log all pending requests for the user to debug
        const allPendingRequests = await this.friendRequestModel.find({
            receiver: user._id,
            status: 'pending',
        }).select('_id receiver status');
        console.log('All pending requests for user:', user._id.toString(), allPendingRequests);

        console.log('Found friend request:', friendRequest);

        // Debug: Check if the request exists at all
        const requestExists = await this.friendRequestModel.findById(requestId);
        console.log('Request exists check:', requestExists);

        if (!friendRequest) {
            if (requestExists && requestExists.sender.toString() === user._id.toString()) {
                // Allow sender to cancel a pending request
                if (requestExists.status === 'pending' && action === 'reject') {
                    requestExists.status = 'canceled';
                    await requestExists.save();
                    console.log('Canceled friend request by sender:', requestExists);
                    return {
                        message: 'Friend request canceled successfully',
                        request: requestExists
                    };
                }
                throw new NotFoundException('You are the sender and cannot accept this request');
            }
            const errorMessage = requestExists
                ? `Friend request found but its status is '${requestExists.status}' and cannot be ${action}ed`
                : 'Friend request not found';
            throw new NotFoundException(errorMessage);
        }

        friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
        await friendRequest.save();

        console.log('Updated friend request:', friendRequest);

        if (action === 'accept') {
            await this.usersService.addFriend(user._id.toString(), friendRequest.sender.toString());
            await this.usersService.addFriend(friendRequest.sender.toString(), user._id.toString());
        }

        return {
            message: `Friend request ${action}ed successfully`,
            request: friendRequest
        };
    }

    async getFriendsAndRequests(user: UserDocument) {
        if (!user._id) throw new BadRequestException('Invalid user');
        const friends = (await this.usersService.findById(user._id as string)).friends || [];
        const friendDetails = await this.usersService.findManyByIds(friends);
        const pendingRequests = await this.friendRequestModel
            .find({ receiver: user._id, status: 'pending' })
            .select('sender senderUsername senderProfilePicture sendDate');
        // console.log('Pending requests query for user:', user._id.toString(), 'result:', pendingRequests);
        return { friends: friendDetails, pendingRequests };
    }
}