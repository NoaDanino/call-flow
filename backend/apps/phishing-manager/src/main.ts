import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { PhishingManagerModule } from './phishing-manager.module';

async function bootstrap() {
  const app = await NestFactory.create(PhishingManagerModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
