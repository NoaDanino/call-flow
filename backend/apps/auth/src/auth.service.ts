import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '@callCenter/database';
import { CreateUserDto } from '@callCenter/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@callCenter/logger';
import { handleErrorThrow } from '@callCenter/utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.info('Validating user credentials', { email });

    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn('User not found during validation', { email });
        throw new UnauthorizedException('User not found');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        this.logger.warn('Invalid password attempt', {
          email,
          userId: user.id,
        });
        throw new UnauthorizedException('Invalid password');
      }

      this.logger.info('User successfully validated', {
        email,
        userId: user.id,
      });
      return user;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to validate user', {
        email,
        error,
      });
    }
  }

  async login(user: User) {
    this.logger.info('Logging in user', { email: user.email, userId: user.id });

    try {
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);

      this.logger.info('Generated JWT token for user', {
        userId: user.id,
        email: user.email,
      });

      return {
        access_token: token,
        role: user.role,
      };
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to login user', {
        userId: user.id,
        error,
      });
    }
  }

  async register(body: CreateUserDto) {
    const { firstName, lastName, email, password } = body;

    this.logger.info('Registering new user', { email });

    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        this.logger.warn('Attempted to register with an existing email', {
          email,
          existingUserId: existingUser.id,
        });
        throw new UnauthorizedException('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.usersRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: UserRole.USER,
      });

      const savedUser = await this.usersRepository.save(user);

      this.logger.info('User registered successfully', {
        email,
        userId: savedUser.id,
      });

      return savedUser;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to register user', {
        email,
        error,
      });
    }
  }
}
