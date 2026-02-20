import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { CartController } from '@order/controllers/cart.controller';
import { OrderController } from '@order/controllers/order.controller';
import { CartService } from '@order/providers/cart.service';
import { OrderService } from '@order/providers/order.service';
import { AuthContractsModule } from '@contracts/auth/contracts-auth.module';
import { CatalogContractsModule } from '@contracts/catalog/contracts-catalog.module';

@Module({
  imports: [ConfigModule, AuthContractsModule, CatalogContractsModule],
  controllers: [CartController, OrderController],
  providers: [CartService, OrderService],
})
export class OrderModule {}
