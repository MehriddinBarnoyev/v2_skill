import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill } from './schemas/skill.schema';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<Skill>) { }

  async create(userId: string, dto: CreateSkillDto) {
    return this.skillModel.create({ ...dto, user: userId });
  }

  findByUser(userId: string) {
    return this.skillModel.find({ user: userId });
  }

  async update(id: string, dto: UpdateSkillDto, userId: string) {
    const skill = await this.skillModel.findById(id);
    if (!skill) throw new NotFoundException('Skill not found');
    if (skill.user.toString() !== userId) throw new ForbiddenException('Not authorized');
    return this.skillModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async getUserSkills(userId: string) {
    return this.skillModel.find({ user: userId });
  }

  async delete(id: string, userId: string) {
    const skill = await this.skillModel.findById(id);
    if (!skill) throw new NotFoundException('Skill not found');
    if (skill.user.toString() !== userId) throw new ForbiddenException('Not authorized');
    await skill.deleteOne();
    return { message: 'Skill deleted' };
  }
  async getAllUsersSkills() {
    return this.skillModel.find().populate('user', 'username fullName profile_picture _id').exec();
  }
}