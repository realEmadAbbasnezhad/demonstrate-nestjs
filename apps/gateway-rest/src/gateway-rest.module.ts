import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth/auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_MICROSERVICE',
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: configService.get<number>('PORT_AUTH') as number,
          },
        }),
      inject: [ConfigService],
    },
    AuthService,
  ],
})
export class GatewayRestModule {}
