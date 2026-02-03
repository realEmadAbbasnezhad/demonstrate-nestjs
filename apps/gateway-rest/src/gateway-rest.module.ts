import { Module } from '@nestjs/common';
import { GatewayRestController } from './gateway-rest.controller';
import { GatewayRestService } from './gateway-rest.service';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  controllers: [GatewayRestController],
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

    GatewayRestService,
  ],
})
export class GatewayRestModule {}
