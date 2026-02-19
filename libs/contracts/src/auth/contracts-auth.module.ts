import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { UsersService } from '@contracts/auth/providers/users.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'AUTH_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: new ConfigService().get<number>('AUTH_PORT') as number,
        },
      },
    ]),
  ],
  controllers: [],
  providers: [AuthService, UsersService],
  exports: [ClientsModule, AuthService, UsersService],
})
export class AuthContractsModule {}
