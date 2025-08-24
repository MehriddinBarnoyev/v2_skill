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

        const newRequest = await this.friendRequestModel.create({
            sender: sender._id,
            receiver: receiver._id,
            senderUsername: sender.username,
            senderProfilePicture: sender.profile_picture,
            sendDate: new Date(),
            status: 'pending',
        }) as FriendRequest;

        return newRequest;
    }

    // async acceptRequest(receiver: UserDocument, requestId: string) {
    //     if (!receiver._id) throw new BadRequestException('Invalid receiver');
    //     if (!Types.ObjectId.isValid(requestId)) {
    //         console.log('Invalid requestId format:', requestId);
    //         throw new BadRequestException('Invalid request ID');
    //     }

    //     const request = await this.friendRequestModel.findOne({
    //         _id: new Types.ObjectId(requestId),
    //         receiver: receiver._id,
    //         status: 'pending',
    //     });

    //     if (!request) {
    //         console.log('Friend request not found for:', {
    //             requestId,
    //             receiverId: receiver._id.toString(),
    //             status: 'pending',
    //         });
    //         throw new NotFoundException('Friend request not found or not pending');
    //     }

    //     request.status = 'accepted';
    //     await request.save();

    //     await this.usersService.update(receiver._id.toString(), {
    //         friends: [...(receiver.friends || []), request.sender.toString()],
    //     });

    //     const sender = await this.usersService.findById(request.sender) || 'fdbsnk93';
    //     if (!sender) {
    //         console.log('Sender not found for ID:', request.sender.toString());
    //         throw new NotFoundException('Sender not found');
    //     }

    //     console.log('Friend request accepted:', {
    //         requestId,
    //         senderId: request.sender.toString(),
    //         receiverId: receiver._id.toString(),
    //     });

    //     await this.usersService.update(sender._id.toString(), {
    //         friends: [...(sender.friends || []), receiver._id.toString()],
    //     });
    //     return { message: 'Friend request accepted' };
    // }

    async getFriendsAndRequests(user: UserDocument) {
        if (!user._id) throw new BadRequestException('Invalid user');
        const friends = (await this.usersService.findById(user._id as string)).friends || [];
        const friendDetails = await this.usersService.findManyByIds(friends);
        const pendingRequests = await this.friendRequestModel
            .find({ receiver: user._id, status: 'pending' })
            .select('sender senderUsername senderProfilePicture sendDate');
        return { friends: friendDetails, pendingRequests };
    }
}