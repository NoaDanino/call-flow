import { NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';

import { PhishingAttempt } from '@phishing/features';
import { LoggerService } from '@phishing/logger';
import { handleErrorThrow } from '@phishing/utils';

export const buildPhishingLink = (attemptId: string, port: number): string => {
  return `http://localhost:${port}/phishing/click/${attemptId}`;
};

export const getOrCreateAttempt = async (
  email: string,
  id: string | undefined,
  phishingAttemptModel: Model<PhishingAttempt>,
  logger: LoggerService,
): Promise<PhishingAttempt> => {
  try {
    if (id) {
      logger.debug('Searching for existing phishing attempt', { id });
      const found = await phishingAttemptModel.findById(id).exec();
      if (!found) {
        logger.error('Phishing attempt not found while searching by ID', {
          id,
        });
        throw new NotFoundException(`Phishing attempt with ID ${id} not found`);
      }
      return found;
    }

    const newAttempt = new phishingAttemptModel({ email });
    await newAttempt.save();
    logger.info('Created new phishing attempt', {
      email,
      id: newAttempt.id,
    });

    return newAttempt;
  } catch (error) {
    handleErrorThrow(logger, 'Failed to get or create phishing attempt', {
      email,
      id,
      error,
    });
  }
};

export const createEmailTransporter = (
  senderEmail: string,
  senderPass: string,
): nodemailer.Transporter => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendEmail = async (
  to: string,
  link: string,
  senderEmail: string,
  senderPass: string,
  logger: LoggerService,
): Promise<void> => {
  try {
    logger.info('Sending email', { to, link });

    const transporter = createEmailTransporter(senderEmail, senderPass);

    await transporter.sendMail({
      from: senderEmail,
      to,
      subject: 'Important Security Alert!',
      html: `<p>This is a security test. Click <a href="${link}">here</a> to review your account activity.</p>`,
    });

    logger.info('Email successfully sent', { to });
  } catch (error) {
    handleErrorThrow(logger, 'Failed to send email', {
      to,
      link,
      error,
    });
  }
};
