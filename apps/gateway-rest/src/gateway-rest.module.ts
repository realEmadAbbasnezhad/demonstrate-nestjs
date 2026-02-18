import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from '@gateway-rest/controllers/auth.controller';
import { UsersController } from '@gateway-rest/controllers/users.controller';
import { ProductsService } from '@gateway-rest/providers/products.service';
import { ProductsController } from '@gateway-rest/controllers/products.controller';
import { CartController } from '@gateway-rest/controllers/cart.controller';
import { CartService } from '@gateway-rest/providers/cart.service';
import { OrderController } from '@gateway-rest/controllers/order.controller';
import { OrderService } from '@gateway-rest/providers/order.service';
import { GatewayExceptionModule } from '@common-gateway/exception/gateway-exception.module';
import { AuthContractsModule } from '@contracts/auth/contracts-auth.module';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'CATALOG_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: new ConfigService().get<number>('PORT_CATALOG') as number,
        },
      },
      {
        name: 'ORDER_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: new ConfigService().get<number>('PORT_ORDER') as number,
        },
      },
    ]),
    GatewayExceptionModule,

    AuthContractsModule,
  ],
  controllers: [
    AuthController,
    UsersController,

    ProductsController,

    CartController,
    OrderController,
  ],
  providers: [ProductsService, CartService, OrderService],
})
export class GatewayRestModule {}
