import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoggerModule } from '@phishing/logger';

import { AuthModule } from './auth/auth.module';
import { PhishingModule } from './phishing/phishing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        __dirname,
        '../../../apps/phishing-manager/.env',
      ),
    }),
    LoggerModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<string>('SERVICE_NAME') || 'PhishingManagerService',
    }),
    AuthModule,
    PhishingModule,
  ],
})
export class PhishingManagerModule {}
