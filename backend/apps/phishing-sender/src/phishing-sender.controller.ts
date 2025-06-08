import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { PhishingRequestDto } from '@phishing/features';
import { LoggerService } from '@phishing/logger';

import { PhishingSenderService } from './phishing-sender.service';

@Controller('phishing')
export class PhishingSenderController {
  private readonly logger: LoggerService;

  constructor(private readonly phishingSenderService: PhishingSenderService) {
    this.logger = new LoggerService(PhishingSenderService.name);
  }

  @Post('send')
  async sendPhishingEmail(@Body() body: PhishingRequestDto) {
    const { email, id } = body;

    this.logger.info('Received phishing email send request', {
      path: 'POST /phishing/send',
      email,
      id,
    });

    const result = await this.phishingSenderService.sendPhishingEmail(
      email,
      id,
    );

    this.logger.info('Phishing email sent', { email, id });

    return result;
  }

  @Get('click/:id')
  async click(@Param('id') id: string) {
    this.logger.info('Phishing click received', {
      path: 'GET /phishing/click/:id',
      id,
    });

    await this.phishingSenderService.markAsClicked(id);

    this.logger.debug('Phishing click marked as successful', { id });

    return 'Thanks for clicking. This was a simulation test.';
  }
}
