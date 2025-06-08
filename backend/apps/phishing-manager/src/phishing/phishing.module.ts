import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseModule } from 'libs/old-app-delete/database';
import { PhishingAttempt, PhishingAttemptSchema } from '@phishing/features';
import { LoggerModule } from '@phishing/logger';

import { PhishingController } from './phishing.controller';
import { PhishingService } from './phishing.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: PhishingAttempt.name, schema: PhishingAttemptSchema },
    ]),
  ],
  controllers: [PhishingController],
  providers: [PhishingService],
})
export class PhishingModule {}
