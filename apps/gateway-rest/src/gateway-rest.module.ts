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
    ]),
  ],
  controllers: [AuthController, UsersController, ProductsController],
  providers: [AuthService, UsersService, ProductsService],
})
export class GatewayRestModule {}
