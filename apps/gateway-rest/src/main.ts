import { NestFactory } from '@nestjs/core';
import { GatewayRestModule } from './gateway-rest.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayRestModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
