import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: { email: string; username: string; password: string }) {
    return this.userModel.create({ ...dto, isDeleted: false });
  }

  async findById(id: string | Types.ObjectId) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('-password');
    if (!user) throw new NotFoundException('User not found or deleted');
    console.log('Raw user data from DB:', user.toObject());
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

    const updateData: Partial<UpdateUserDto> = {};
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.skills !== undefined) updateData.skills = dto.skills;
    if (dto.education !== undefined) updateData.education = dto.education;
    if (dto.certificates !== undefined) updateData.certificates = dto.certificates;
    if (dto.isDeleted !== undefined) updateData.isDeleted = dto.isDeleted;

    console.log('Updating user with data:', updateData);
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  }

  async updateProfilePicture(id: string | Types.ObjectId, profilePictureUrl: string) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false });
    if (!user) throw new NotFoundException('User not found or deleted');

    console.log('Updating profile picture for user:', id.toString(), 'with URL:', profilePictureUrl);
    console.log('Type of profilePictureUrl:', typeof profilePictureUrl, 'Value:', profilePictureUrl);

    const url = String(profilePictureUrl);

    return this.userModel
      .findByIdAndUpdate(id, { profile_picture: url }, { new: true })
      .select('-password');
  }

  async updateCertificates(id: string | Types.ObjectId, certificateUrls: string[]) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false });
    if (!user) throw new NotFoundException('User not found or deleted');

    const updatedCertificates = [...(user.certificates || []), ...certificateUrls];
    return this.userModel
      .findByIdAndUpdate(id, { certificates: updatedCertificates }, { new: true })
      .select('-password');
  }

  async findManyByIds(ids: (string | Types.ObjectId)[]) {
    return this.userModel
      .find({ _id: { $in: ids }, isDeleted: false })
      .select('username name profile_picture');
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

  async addFriend(userId: string, friendId: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.friends?.map(id => id.toString()).includes(friendId)) {
      if (!user.friends) user.friends = [];
      user.friends.push(new Types.ObjectId(friendId));
      await user.save();
      console.log('Added friend:', friendId, 'to user:', userId);
    } else {
      console.log('Friend:', friendId, 'already exists for user:', userId);
    }

    return user;
  }
}