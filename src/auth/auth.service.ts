import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException('Email in use');
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ email, password: hashed, isVerified: false });
    await this.sendOtp(email); // Auto-send OTP
    return { message: 'User registered. Verify OTP sent to email.', userId: user._id };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new BadRequestException('Account not verified. Please verify OTP first.');
    }
    await this.sendOtp(email); // Auto-send OTP for 2FA
    return { message: 'OTP sent to email for login verification.' };
  }

  async verifyLogin(email: string, otp: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    const token = this.jwtService.sign({ id: user._id });
    return { token };
  }

  async sendOtp(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP:', otp); // Print to console
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true; // Verify account
    await user.save();
    return { message: 'OTP verified' };
  }
}