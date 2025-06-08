import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoggerModule } from '@callCenter/logger';

import { CallsService } from './calls-service.service';
import { CallsController } from './calls-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag, Call, Task, CallTag, SuggestedTask } from '@callCenter/database';
import { DatabaseModule } from '@callCenter/database';

//TODO: add @libs shortcut

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../apps/tags-service/.env'),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<string>('SERVICE_NAME') || 'CallsService',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Call, Tag, Task, CallTag, SuggestedTask]),
  ],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
