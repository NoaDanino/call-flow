import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Logger,
} from '@nestjs/common';

import { PhishingManagerRequestDto } from '@phishing/features';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { PhishingService } from './phishing.service';

@Controller('phishing-manager')
export class PhishingController {
  private readonly logger = new Logger(PhishingController.name);

  constructor(private readonly phishingService: PhishingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendPhishing(@Body() dto: PhishingManagerRequestDto) {
    this.logger.log(`sendPhishing called with DTO: ${JSON.stringify(dto)}`);
    const result = await this.phishingService.sendEmail(dto);
    this.logger.log(`sendPhishing result: ${JSON.stringify(result)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-attempts')
  async getAllAttempts() {
    this.logger.log('getAllAttempts called');
    const attempts = await this.phishingService.getAttempts();
    this.logger.log(`getAllAttempts result count: ${attempts.length}`);
    return attempts;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAttemptById(@Param('id') id: string) {
    this.logger.log(`getAttemptById called with id: ${id}`);
    const attempt = await this.phishingService.getAttemptById(id);
    if (attempt) {
      this.logger.log(`getAttemptById found attempt with id: ${id}`);
    } else {
      this.logger.warn(`getAttemptById no attempt found with id: ${id}`);
    }
    return attempt;
  }
}
