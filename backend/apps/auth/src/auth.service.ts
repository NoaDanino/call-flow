// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  User,
  UserRole,
} from '../../../libs/database/src/entities/user.entity';
import { CreateUserDto } from 'libs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');
    return user;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
    };
  }

  //TODO: if email is taken or user name already exists, throw an error (and show it in frontend)
  async register(body: CreateUserDto) {
    const { firstName, lastName, email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      role: UserRole.USER,
    });
    return this.usersRepository.save(user);
  }
}
