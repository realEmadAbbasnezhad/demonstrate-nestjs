import { NestFactory } from '@nestjs/core';
import { GatewayRestModule } from './gateway-rest.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(GatewayRestModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT_GATEWAY_REST') as number;
  Logger.log(`RESTful Gateway is running on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

void bootstrap().then();
