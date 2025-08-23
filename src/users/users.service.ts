import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Import Types for ObjectId
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string | Types.ObjectId) {
    const user = await this.userModel.findById(id).select('-password -otp -otpExpires');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string | Types.ObjectId, dto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).select('-password -otp -otpExpires');
  }
}