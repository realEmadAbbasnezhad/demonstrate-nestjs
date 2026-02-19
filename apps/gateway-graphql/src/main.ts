import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ExceptionDto } from '@common-gateway/exception/gateway-exception.dto';
import { GatewayExceptionFilter } from '@common-gateway/exception/gateway-exception.filter';
import { GatewayGraphqlModule } from './gateway-graphql.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(GatewayGraphqlModule);

  // CORS configuration and security headers
  // app.enableCors();
  // app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        throw new BadRequestException({
          validationErrors: errors,
          message: '',
        } as ExceptionDto);
      },
    }),
  );
  app.useGlobalFilters(new GatewayExceptionFilter());

  const port = new ConfigService().get<number>(
    'PORT_GATEWAY_GRAPHQL',
  ) as number;
  Logger.log(`RESTful Gateway is running on port ${port}`, 'Bootstrap');
  await app.listen(port);
}
void bootstrap().then();
