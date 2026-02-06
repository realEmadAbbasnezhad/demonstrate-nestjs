import { Module } from '@nestjs/common';
import { AuthorizationController } from './controllers/authorization.controller';
import { ConfigModule } from '@common/config/config.module';
import { AuthorizationService } from './providers/authorization/authorization.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { AuthenticationService } from './providers/authorization/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashModule } from '@common/hash/hash.module';
import { PrismaModule } from '@common/prisma/prisma.module';
import { ExceptionModule } from '@common/exception/exception.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: new ConfigService().get<string>('AUTH_JWT_KEY') as string,
    }),
    HashModule,
    PrismaModule,
    ExceptionModule,
  ],
  controllers: [AuthenticationController, AuthorizationController],
  providers: [AuthenticationService, AuthorizationService],
})
export class AuthModule {}
