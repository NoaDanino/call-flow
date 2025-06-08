import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoggerModule } from '@callCenter/logger';

import { SuggestedTaskController } from './suggested-tasks-service.controller';
import { SuggestedTaskService } from './suggested-tasks-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, Tag, SuggestedTask } from '@callCenter/database';

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
        configService.get<string>('SERVICE_NAME') || 'SuggestedTasksService',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Task, Tag, SuggestedTask]),
  ],
  controllers: [SuggestedTaskController],
  providers: [SuggestedTaskService],
})
export class SuggestedTasksModule {}
