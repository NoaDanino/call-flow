import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoggerModule } from '@phishing/logger';

import { TaskController } from './tasks-service.controller';
import { TaskService } from './tasks-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, Call } from '../../../libs/database';

import { DatabaseModule } from '../../../libs/database';

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
        configService.get<string>('SERVICE_NAME') || 'TasksService',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Task, Call]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TasksModule {}
