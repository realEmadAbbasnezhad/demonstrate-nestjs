import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthService } from './providers/auth.service';
import { UsersService } from './providers/users.service';

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
  controllers: [],
  providers: [AuthService, UsersService],
  exports: [ClientsModule, AuthService, UsersService],
})
export class AuthContractsModule {}
