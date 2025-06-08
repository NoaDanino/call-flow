import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseModule } from 'libs/old-app-delete/database';
import { PhishingAttempt, PhishingAttemptSchema } from '@phishing/features';
import { LoggerModule } from '@phishing/logger';

import { PhishingSenderController } from './phishing-sender.controller';
import { PhishingSenderService } from './phishing-sender.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        __dirname,
        '../../../apps/phishing-sender/.env',
      ),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<string>('SERVICE_NAME') || 'PhishingSenderService',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: PhishingAttempt.name, schema: PhishingAttemptSchema },
    ]),
  ],
  controllers: [PhishingSenderController],
  providers: [PhishingSenderService],
})
export class PhishingModule {}
