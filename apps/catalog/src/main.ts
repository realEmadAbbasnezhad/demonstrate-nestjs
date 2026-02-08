import { NestFactory } from '@nestjs/core';
import { CatalogModule } from './catalog.module';

async function bootstrap() {
  const app = await NestFactory.create(CatalogModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
