import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth/auth.service';
import { AuthGuard } from './providers/auth/auth.guard';

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
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
})
export class GatewayRestModule {}
