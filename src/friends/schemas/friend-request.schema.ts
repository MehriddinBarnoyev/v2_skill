import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FriendRequest extends Document {
  @ApiProperty({ description: 'Sender of the friend request', type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @ApiProperty({ description: 'Receiver of the friend request', type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @ApiProperty({ description: 'Username of the sender', example: 'user123' })
  @Prop({ required: true })
  senderUsername: string;

  @ApiProperty({ description: 'Profile picture of the sender', example: 'https://example.com/profile.jpg' })
  @Prop()
  senderProfilePicture?: string;

  @ApiProperty({ description: 'Date the request was sent', example: '2025-08-24T12:00:00Z' })
  @Prop({ default: Date.now })
  sendDate: Date;

  @ApiProperty({ description: 'Status of the request', example: 'pending', enum: ['pending', 'accepted', 'rejected'] })
  @Prop({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: string;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);