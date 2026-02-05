import { Module } from '@nestjs/common';
import { AuthorizationController } from './controllers/authorization.controller';
import { ConfigModule } from '@common/config/config.module';
import { AuthorizationService } from './providers/authorization/authorization.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { AuthenticationService } from './providers/authorization/authentication.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthenticationController, AuthorizationController],
  providers: [AuthenticationService, AuthorizationService],
})
export class AuthModule {}
