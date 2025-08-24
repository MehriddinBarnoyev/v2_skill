import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, username, password } = dto;
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) throw new BadRequestException('Email in use');
    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) throw new BadRequestException('Username in use');
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, username, password: hashed });
    return { message: 'User registered', userId: user._id };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ id: user._id });
    return { token };
  }
}