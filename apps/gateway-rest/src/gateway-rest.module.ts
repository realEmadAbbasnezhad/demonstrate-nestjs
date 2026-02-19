import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { AuthController } from '@gateway-rest/controllers/auth.controller';
import { UsersController } from '@gateway-rest/controllers/users.controller';
import { ProductsController } from '@gateway-rest/controllers/products.controller';
import { AuthContractsModule } from '@contracts/auth/contracts-auth.module';
import { CatalogContractsModule } from '@contracts/catalog/contracts-catalog.module';

@Module({
  imports: [ConfigModule, AuthContractsModule, CatalogContractsModule],
  controllers: [AuthController, UsersController, ProductsController],
  providers: [],
})
export class GatewayRestModule {}
