import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { CartController } from '@order/controllers/cart.controller';
import { OrderController } from '@order/controllers/order.controller';

@Module({
  imports: [ConfigModule],
  controllers: [CartController, OrderController],
  providers: [],
})
export class OrderModule {}
