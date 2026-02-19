import { NestFactory } from '@nestjs/core';
import { CatalogModule } from './catalog.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@common-microservice/exception/microservice-exception.filter';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(CatalogModule);
  const configService = appContext.get(ConfigService);

  const port = configService.get<number>('CATALOG_PORT') as number;
  Logger.log(`Catalog is running on port ${port}`, 'Bootstrap');

  const app = await NestFactory.createMicroservice(CatalogModule, {
    transport: Transport.TCP,
    options: { port: port },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
}

void bootstrap().then();
