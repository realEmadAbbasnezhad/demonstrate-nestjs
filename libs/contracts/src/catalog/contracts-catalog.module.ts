import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductsService } from '@contracts/catalog/providers/products.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'CATALOG_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: new ConfigService().get<number>('CATALOG_PORT') as number,
        },
      },
    ]),
  ],
  controllers: [],
  providers: [ProductsService],
  exports: [ProductsService, ClientsModule],
})
export class CatalogContractsModule {}
