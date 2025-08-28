import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  name?: string;

  @Prop({ type: [String], default: [] }) // Changed to array of strings
  skills?: string[];

  @Prop({ type: [String], default: [] }) // Changed to array of strings
  education?: string[];

  @Prop({ type: [String], default: [] })
  certificates?: string[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  friends?: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  profile_picture?: string;
  _id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);