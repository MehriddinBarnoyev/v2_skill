import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
  @Prop({ unique: true, required: true })
  email: string;

  @ApiProperty({ description: 'The username of the user', example: 'user123' })
  @Prop({ unique: true, required: true })
  username: string;

  @ApiProperty({ description: 'The password of the user', example: 'password123' })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @Prop()
  name?: string;

  @ApiProperty({ description: 'The bio of the user', example: 'Software Developer' })
  @Prop()
  bio?: string;

  @ApiProperty({ description: 'The profile picture of the user', example: 'https://example.com/profile.jpg' })
  @Prop()
  profile_picture?: string;

  @ApiProperty({ description: 'The age of the user', example: 30 })
  @Prop()
  age?: number;

  @ApiProperty({ description: 'The location of the user', example: 'New York, USA' })
  @Prop()
  location?: string;

  @ApiProperty({ description: 'The skills of the user', example: ['JavaScript', 'Python'] })
  @Prop([String])
  skills?: string[];

  @ApiProperty({ description: 'The certificates of the user', example: ['AWS Certified Developer'] })
  @Prop([String])
  certificates?: string[];

  @ApiProperty({ description: 'The experience of the user', example: ['Software Engineer at XYZ', 'Intern at ABC'] })
  @Prop([String])
  experience?: string[];

  @ApiProperty({ description: 'The friends of the user', example: [] })
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  friends: Types.ObjectId[];


  @ApiProperty({ description: 'The hobbies of the user', example: ['Reading', 'Traveling'] })
  @Prop([String])
  hobbies?: string[];

  @ApiProperty({ description: 'The isDeleted status of the user', example: false })
  @Prop({ default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'The education of the user', example: ['BSc Computer Science'] })
  @Prop([String])
  education?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);