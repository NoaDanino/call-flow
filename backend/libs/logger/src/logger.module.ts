// libs/logger/logger.module.ts
import {
  DynamicModule,
  Module,
  Provider,
  ModuleMetadata,
} from '@nestjs/common';

import { LoggerService, LOGGER_SERVICE_NAME } from './logger.service';

interface LoggerModuleAsyncOptions {
  isGlobal?: boolean;
  imports?: ModuleMetadata['imports']; // Modules to import (e.g., ConfigModule)
  useFactory: (...args: any[]) => Promise<string> | string;
  inject?: any[]; // Providers to inject into useFactory (e.g., ConfigService)
}

@Module({})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_SERVICE_NAME,
          useValue: serviceName,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: LOGGER_SERVICE_NAME,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: LoggerModule,
      global: options.isGlobal || false,
      imports: options.imports || [],
      providers: [asyncProvider, LoggerService],
      exports: [LoggerService],
    };
  }
}
