import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;


@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({ description: 'Email of the user', example: 'user@example.com' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'Username of the user', example: 'user123' })
  @Prop({ required: true, unique: true })
  username: string;

  @ApiProperty({ description: 'Password of the user', example: 'password123' })
  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'http://localhost:3000/uploads/profile.jpg' })
  @Prop()
  profile_picture?: string;

  @ApiProperty({ description: 'Array of certificate URLs', type: [String], example: ['http://localhost:3000/uploads/cert1.pdf', 'http://localhost:3000/uploads/cert2.pdf'] })
  @Prop({ type: [String], default: [] })
  certificates: string[];

  @ApiProperty({ description: 'Array of friend IDs', type: [String], example: ['507f1f77bcf86cd799439011'] })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  friends: Types.ObjectId[];

  @ApiProperty({ description: 'Array of skills', type: [String], example: ['JavaScript', 'Python'] })
  @Prop({ type: [String], default: [] })
  skills: string[];

  @ApiProperty({ description: 'Name of the user', example: 'John Doe' })
  @Prop()
  name?: string;

  @ApiProperty({ description: 'Education of the user', example: 'Computer Science' })
  @Prop()
  education?: string;

  @ApiProperty({ description: 'Whether the user is deleted', example: false })
  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);