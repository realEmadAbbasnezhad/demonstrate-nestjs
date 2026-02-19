import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GatewayExceptionFilter } from '@common-gateway/exception/gateway-exception.filter';
import { GatewayGraphqlModule } from './gateway-graphql.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(GatewayGraphqlModule);

  // CORS configuration and security headers
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'cdn.jsdelivr.net',
            'unpkg.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'cdn.jsdelivr.net',
            'unpkg.com',
          ],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'cdn.jsdelivr.net', 'unpkg.com'],
          connectSrc: ["'self'", 'https:'],
        },
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) =>
        GatewayExceptionFilter.ValidationExceptionFactory(errors),
    }),
  );
  app.useGlobalFilters(new GatewayExceptionFilter());

  const port = new ConfigService().get<number>(
    'GRAPHIQL_GATEWAY_PORT',
  ) as number;
  Logger.log(`RESTful Gateway is running on port ${port}`, 'Bootstrap');
  await app.listen(port);
}
void bootstrap().then();
