import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { PhishingModule } from './phishing-sender.module';

async function bootstrap() {
  const app = await NestFactory.create(PhishingModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
}
bootstrap();
