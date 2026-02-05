import { NestFactory, Reflector } from '@nestjs/core';
import { GatewayRestModule } from './gateway-rest.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthGuard } from './providers/auth/auth.guard';
import { AuthService } from './providers/auth/auth.service';

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
      .addBearerAuth(undefined, 'jwt')
      .build();
    const document = SwaggerModule.createDocument(app, documentBuilder);
    SwaggerModule.setup('swagger', app, document);
    Logger.log(
      `Swagger is started and listening on "/${swaggerPath}"!`,
      'Bootstrap',
    );
  }

  app.useGlobalGuards(new AuthGuard(new Reflector(), app.get(AuthService)));
  app.enableCors({
    origin: 'localhost',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const port = configService.get<number>('PORT_GATEWAY_REST') as number;
  Logger.log(`RESTful Gateway is running on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

void bootstrap().then();
