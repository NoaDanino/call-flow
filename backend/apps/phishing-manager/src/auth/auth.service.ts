import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { UserRole, User } from '@phishing/features';
import { LoggerService } from '@phishing/logger';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      this.logger.info('Registering user', { email: dto.email });
      const hash = await bcrypt.hash(dto.password, 10);
      const user = new this.userModel({
        email: dto.email,
        name: dto.name,
        lastName: dto.lastName,
        company: dto.company,
        password: hash,
        role: UserRole.USER,
      });
      this.logger.info('User model instance created', { email: dto.email });

      await user.save();
      this.logger.info('User saved successfully', { email: dto.email });

      return { message: 'User registered' };
    } catch (error) {
      this.logger.error('Registration error', { error, email: dto.email });

      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new BadRequestException(`${field} already exists`);
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      this.logger.info('Login attempt', { email: dto.email });

      const user = await this.userModel.findOne({ email: dto.email }).exec();

      if (user && (await bcrypt.compare(dto.password, user.password))) {
        const token = this.jwtService.sign({ email: user.email });
        this.logger.info('Login successful', { email: dto.email });
        return { token };
      }

      this.logger.warn('Login failed - invalid credentials', {
        email: dto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      this.logger.error('Login error', { error, email: dto.email });
      throw error;
    }
  }
}
