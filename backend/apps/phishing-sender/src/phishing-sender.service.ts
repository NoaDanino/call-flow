import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PhishingAttempt } from '@phishing/features';
import { LoggerService } from '@phishing/logger';
import { handleErrorThrow } from '@phishing/utils';
import {
  getOrCreateAttempt,
  buildPhishingLink,
  sendEmail,
} from './utils/phishing-sender-utils';

@Injectable()
export class PhishingSenderService {
  private senderEmail: string;
  private senderPass: string;
  private port: number;

  constructor(
    @InjectModel(PhishingAttempt.name)
    private readonly phishingAttemptModel: Model<PhishingAttempt>,
    private configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.senderEmail =
      this.configService.get<string>('EMAIL') || 'phishingcymulate@gmail.com';
    this.senderPass =
      this.configService.get<string>('EMAIL_PASS') || 'dpov qtvz rytf fesa';
    this.port = this.configService.get<number>('PORT') || 3000;
  }

  async sendPhishingEmail(
    email: string,
    id?: string,
  ): Promise<PhishingAttempt> {
    try {
      this.logger.info('Starting to send phishing email', { email, id });

      const attempt = await getOrCreateAttempt(
        email,
        id,
        this.phishingAttemptModel,
        this.logger,
      );

      attempt.link = buildPhishingLink(attempt.id, this.port);
      await attempt.save();

      this.logger.info('Generated phishing link', {
        link: attempt.link,
        email,
        id,
      });
      await sendEmail(
        email,
        attempt.link,
        this.senderEmail,
        this.senderPass,
        this.logger,
      );

      this.logger.info('Phishing email process completed', { email, id });

      return attempt;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to send phishing email', {
        email,
        id,
        error,
      });
    }
  }

  async markAsClicked(id: string): Promise<PhishingAttempt> {
    try {
      this.logger.info('Received click for phishing attempt', { id });

      const attempt = await this.phishingAttemptModel.findById(id).exec();

      if (!attempt) {
        handleErrorThrow(this.logger, 'Phishing attempt not found', {
          id,
        });
      }

      if (!attempt.clicked) {
        attempt.clicked = true;
        attempt.clickedAt = new Date();
        await attempt.save();
        this.logger.info('Marked phishing attempt as clicked', { id });
      } else {
        this.logger.debug('Phishing attempt already marked as clicked', { id });
      }

      return attempt;
    } catch (error) {
      handleErrorThrow(
        this.logger,
        'Failed to mark phishing attempt as clicked',
        { id, error },
      );
    }
  }
}
