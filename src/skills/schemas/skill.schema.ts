import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Skill extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: {
    username: string;
    fullName: string;
    profile_picture: string;
    _id: Types.ObjectId;
  };

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  level?: string; // e.g., 'beginner', 'intermediate', 'expert'
}

export const SkillSchema = SchemaFactory.createForClass(Skill);