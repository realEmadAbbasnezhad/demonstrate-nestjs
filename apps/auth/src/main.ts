import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AuthModule);
  const configService = appContext.get(ConfigService);

  const port = configService.get<number>('PORT_AUTH') as number;
  Logger.log(`Auth is running on port ${port}`, 'Bootstrap');

  const app = await NestFactory.createMicroservice(AuthModule, {
    transport: Transport.TCP,
    options: {
      port: port,
    },
  });

  await app.listen();
}

void bootstrap().then();
