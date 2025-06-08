// libs/logger/logger.service.ts
import { Injectable, Inject, Scope } from '@nestjs/common';
import * as winston from 'winston';

export const LOGGER_SERVICE_NAME = 'LOGGER_SERVICE_NAME';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger: winston.Logger;

  constructor(@Inject(LOGGER_SERVICE_NAME) private serviceName: string) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] [${this.serviceName}] ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }),
      ],
    });
  }

  private formatMessage(
    message: string,
    meta?: Record<string, unknown>,
  ): string {
    return meta ? `${message} | ${JSON.stringify(meta)}` : message;
  }

  log(message: string, meta?: Record<string, unknown>) {
    this.logger.info(this.formatMessage(message, meta));
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(this.formatMessage(message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(this.formatMessage(message, meta));
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.logger.error(this.formatMessage(message, meta));
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.logger.debug(this.formatMessage(message, meta));
  }

  verbose(message: string, meta?: Record<string, unknown>) {
    this.logger.verbose(this.formatMessage(message, meta));
  }
}
