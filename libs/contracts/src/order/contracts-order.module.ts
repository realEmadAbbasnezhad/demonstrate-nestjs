import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartService } from '@contracts/order/providers/cart.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'ORDER_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: new ConfigService().get<number>('ORDER_PORT') as number,
        },
      },
    ]),
  ],
  controllers: [],
  providers: [CartService],
  exports: [CartService],
})
export class OrderContractsModule {}
