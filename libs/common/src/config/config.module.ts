import { Module } from '@nestjs/common';
import {
  ConfigService,
  ConfigModule as NestConfigModule, // due to conflict with our "ConfigModule"
} from '@nestjs/config';
import { ENV_SCHEMA } from './env.schema';

@Module({
  imports: [NestConfigModule.forRoot({ validationSchema: ENV_SCHEMA })],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
