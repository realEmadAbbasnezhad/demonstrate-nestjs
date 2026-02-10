import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashModule } from '@common/hash/hash.module';
import { ExceptionModule } from '@common/exception/exception.module';
import { AuthController } from '@auth/controllers/auth.controller';
import { UsersController } from '@auth/controllers/users.controller';
import { AuthService } from '@auth/providers/auth.service';
import { UsersService } from '@auth/providers/users.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: new ConfigService().get<string>('AUTH_JWT_KEY') as string,
    }),
    HashModule,
    ExceptionModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
