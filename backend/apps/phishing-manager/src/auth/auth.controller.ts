import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoggerService } from '@phishing/logger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  async register(@Body() user: RegisterDto) {
    this.logger.info('Received registration request', {
      path: 'POST /auth/register',
      user,
    });
    const result = await this.authService.register(user);
    this.logger.info('Phishing email sent', { result });
    return result;
  }
  //TODO: handle validation (if email not sent its still going to the server)
  @HttpCode(200)
  @Post('login')
  login(@Body() loginUser: LoginDto) {
    this.logger.info('Received login request', {
      path: 'POST /auth/login',
      loginUser,
    });
    return this.authService.login(loginUser);
  }
}
