import axios from 'axios';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { LoggerService } from '@phishing/logger';
import { handleErrorThrow } from '@phishing/utils';
import { Model } from 'mongoose';
import { PhishingAttempt } from '@phishing/features';

export async function createPhishingAttempt(
  email: string,
  model: Model<PhishingAttempt>,
  logger: LoggerService,
) {
  try {
    const attempt = new model({ email, clicked: false });
    await attempt.save();
    return attempt;
  } catch (error) {
    handleErrorThrow(logger, 'Failed to create phishing attempt', { error });
  }
}

export async function sendPhishingRequest(
  email: string,
  id: string,
  url: string,
  logger: LoggerService,
) {
  try {
    logger.info('Sending phishing email', {
      path: 'POST /phishing/send',
      email,
      id,
    });

    await axios.post(url, { email, id });
  } catch (error) {
    logger.error('Failed to send phishing email', { email, id, error });

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
}

export async function fetchAllAttempts(
  model: Model<PhishingAttempt>,
  logger: LoggerService,
) {
  try {
    return await model.find().sort({ sentAt: -1 }).exec();
  } catch (error) {
    handleErrorThrow(logger, 'Failed to fetch phishing attempts', { error });
  }
}

export async function fetchAttemptById(
  model: Model<PhishingAttempt>,
  logger: LoggerService,
  id: string,
) {
  try {
    const attempt = await model.findById(id).exec();

    if (!attempt) {
      throw new NotFoundException(`Attempt with id ${id} not found`);
    }

    return attempt;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    logger.error(`Failed to fetch attempt with id ${id}`, { id, error });

    throw error instanceof NotFoundException ||
      error instanceof BadRequestException
      ? error
      : new InternalServerErrorException('Could not get phishing attempt');
  }
}
