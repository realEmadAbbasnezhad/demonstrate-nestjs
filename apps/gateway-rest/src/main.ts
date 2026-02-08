import { NestFactory } from '@nestjs/core';
import { GatewayRestModule } from './gateway-rest.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionsFilter } from './providers/exception/exeption.filter';
import { ExceptionDto } from './providers/exception/exception.dto';

async function bootstrap() {
  const app = await NestFactory.create(GatewayRestModule);
  const configService = app.get(ConfigService);

  const swaggerEnabled = configService.get<boolean>(
    'SWAGGER_ENABLED',
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

  app.enableCors({
    origin: 'localhost',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

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
  app.useGlobalFilters(new HttpExceptionsFilter());

  const port = configService.get<number>('PORT_GATEWAY_REST') as number;
  Logger.log(`RESTful Gateway is running on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

void bootstrap().then();
