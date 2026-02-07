import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth/auth.service';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './providers/users/users.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'AUTH_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: new ConfigService().get<number>('PORT_AUTH') as number,
        },
      },
    ]),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService],
})
export class GatewayRestModule {}
