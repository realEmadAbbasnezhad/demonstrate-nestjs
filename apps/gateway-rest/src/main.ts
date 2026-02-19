import { NestFactory } from '@nestjs/core';
import { GatewayRestModule } from './gateway-rest.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { GatewayExceptionFilter } from '@common-gateway/exception/gateway-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayRestModule);
  const configService = app.get(ConfigService);

  // Swagger setup
  const swaggerEnabled = configService.get<boolean>(
    'ENABLE_SWAGGER',
  ) as boolean;
  if (swaggerEnabled) {
    const swaggerPath = configService.get<string>('SWAGGER_PATH') as string;
    const documentBuilder = new DocumentBuilder()
      .setTitle('RESTful Gateway API')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .build();
    const document = SwaggerModule.createDocument(app, documentBuilder);
    document.security = [{ bearer: [] }];
    SwaggerModule.setup('swagger', app, document);
    Logger.log(
      `Swagger is started and listening on "/${swaggerPath}"!`,
      'Bootstrap',
    );
  }

  // CORS configuration and security headers
  app.enableCors();
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) =>
        GatewayExceptionFilter.ValidationExceptionFactory(errors),
    }),
  );
  app.useGlobalFilters(new GatewayExceptionFilter());

  const port = configService.get<number>('GATEWAY_REST_PORT') as number;
  Logger.log(`RESTful Gateway is running on port ${port}`, 'Bootstrap');
  await app.listen(port);
}
void bootstrap().then();
