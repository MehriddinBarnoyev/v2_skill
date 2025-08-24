import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async create(dto: { email: string; username: string; password: string }) {
    return this.userModel.create({ ...dto, isDeleted: false });
  }

  async findById(id: string | Types.ObjectId) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('-password');
    if (!user) throw new NotFoundException('User not found or deleted');
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email, isDeleted: false }).select('+password');
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username, isDeleted: false });
  }

  async update(id: string | Types.ObjectId, dto: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false });
    if (!user) throw new NotFoundException('User not found or deleted');
    return this.userModel.findByIdAndUpdate(id, { ...dto, isDeleted: dto.isDeleted ?? false }, { new: true }).select('-password');
  }

  async search(query: { skill?: string; username?: string; name?: string; education?: string }) {
    const conditions: any = { isDeleted: false };
    if (query.skill) {
      conditions.skills = { $in: [new RegExp(query.skill, 'i')] };
    }
    if (query.username) {
      conditions.username = new RegExp(query.username, 'i');
    }
    if (query.name) {
      conditions.name = new RegExp(query.name, 'i');
    }
    if (query.education) {
      conditions.education = { $in: [new RegExp(query.education, 'i')] };
    }
    return this.userModel.find(conditions).select('-password');
  }

  async findManyByIds(ids: (string | Types.ObjectId)[]) {
    return this.userModel.find({ _id: { $in: ids }, isDeleted: false }).select('username name profile_picture');
  }
}