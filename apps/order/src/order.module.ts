import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { CartController } from '@order/controllers/cart.controller';
import { OrderController } from '@order/controllers/order.controller';
import { CartService } from '@order/providers/cart.service';
import { OrderService } from '@order/providers/order.service';

@Module({
  imports: [ConfigModule],
  controllers: [CartController, OrderController],
  providers: [CartService, OrderService],
})
export class OrderModule {}
