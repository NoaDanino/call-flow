import { NestFactory } from '@nestjs/core';
import { SuggestedTasksModule } from './suggested-tasks-service.module';
import { ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(SuggestedTasksModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  //This tells NestJS to respect @Exclude() and @Expose() decorators on response objects.

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3003;
  await app.listen(port);
}
bootstrap();
