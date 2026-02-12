import { NestFactory } from '@nestjs/core';
import { OrderModule } from '@order/order.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@common/exception/exception.filter';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(OrderModule);
  const configService = appContext.get(ConfigService);

  const port = configService.get<number>('PORT_ORDER') as number;
  Logger.log(`Catalog is running on port ${port}`, 'Bootstrap');

  const app = await NestFactory.createMicroservice(OrderModule, {
    transport: Transport.TCP,
    options: { port: port },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
}

void bootstrap().then();
