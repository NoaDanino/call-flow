import { LoggerService } from '@phishing/logger';
import { InternalServerErrorException } from '@nestjs/common';

export function handleErrorThrow(
  logger: LoggerService,
  message: string,
  meta: Record<string, unknown> = {},
): never {
  logger.error(message, meta);
  throw new InternalServerErrorException(message);
}
