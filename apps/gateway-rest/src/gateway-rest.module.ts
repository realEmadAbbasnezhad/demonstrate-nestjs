import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from '@gateway-rest/controllers/auth.controller';
import { AuthService } from '@gateway-rest/providers/auth/auth.service';
import { UsersController } from '@gateway-rest/controllers/users.controller';
import { UsersService } from '@gateway-rest/providers/users.service';
import { ProductsService } from '@gateway-rest/providers/products.service';
import { ProductsController } from '@gateway-rest/controllers/products.controller';
import { CartController } from '@gateway-rest/controllers/cart.controller';
import { CartService } from '@gateway-rest/providers/cart.service';

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
  ],
  controllers: [
    AuthController,
    UsersController,
    ProductsController,
    CartController,
  ],
  providers: [AuthService, UsersService, ProductsService, CartService],
})
export class GatewayRestModule {}
