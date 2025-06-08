import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';

import { PhishingAttempt } from '@phishing/features';
import { LoggerService } from '@phishing/logger';

@Injectable()
export class PhishingService {
  private phishingSenderUrl: string;

  constructor(
    @InjectModel(PhishingAttempt.name)
    private readonly phishingAttemptModel: Model<PhishingAttempt>,
    private configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.phishingSenderUrl =
      this.configService.get<string>('PHISHING_SENDER_URL') ||
      'http://localhost:3000/phishing/send';
  }

  async sendEmail(dto: { email: string }) {
    try {
      const attempt = await this.createPhishingAttempt(dto.email);
      await this.notifyPhishingSender(dto.email, attempt._id);
      return attempt;
    } catch (error) {
      this.handleSendEmailError(error);
    }
  }

  private async createPhishingAttempt(email: string): Promise<PhishingAttempt> {
    const attempt = new this.phishingAttemptModel({
      email,
      clicked: false,
    });
    await attempt.save();
    return attempt;
  }

  private async notifyPhishingSender(
    email: string,
    id: unknown,
  ): Promise<void> {
    await axios.post(this.phishingSenderUrl, { email, id });
  }

  private handleSendEmailError(error: unknown): never {
    this.logger.error('Failed to send phishing email', { error });

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (!status || status >= 500) {
        throw new ServiceUnavailableException('Phishing sender unavailable');
      }

      if (status === 400) {
        throw new BadRequestException('Invalid request to phishing sender');
      }
    }

    throw new InternalServerErrorException('Could not send phishing email');
  }

  async getAttempts() {
    try {
      return this.phishingAttemptModel.find().sort({ sentAt: -1 }).exec();
    } catch (error) {
      this.logger.error('Failed to fetch phishing attempts', error);
      throw new InternalServerErrorException('Could not get phishing attempts');
    }
  }

  async getAttemptById(id: string) {
    try {
      const attempt = await this.phishingAttemptModel.findById(id).exec();

      if (!attempt) {
        this.logger.error('Attempt not found with this id', { id });
        throw new NotFoundException(`Attempt with id ${id} not found`);
      }

      return attempt;
    } catch (error) {
      this.handleGetAttemptByIdError(error, id);
    }
  }

  private handleGetAttemptByIdError(error: unknown, id: string): never {
    if ((error as any).name === 'CastError') {
      this.logger.error('Invalid ID format: {}', { id, error });
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    this.logger.error('Failed to fetch attempt with id {}', { id, error });

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new InternalServerErrorException('Could not get phishing attempt');
  }
}
