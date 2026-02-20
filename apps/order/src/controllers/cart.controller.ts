import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderCommands } from '@contracts/order/order.commands';
import {
  CreateOrderResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';
import { CartService } from '@order/providers/cart.service';
import { CreateCartMicroserviceDto } from '@contracts/order/providers/cart.dto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern(OrderCommands.CartUpdate)
  public async update(
    @Payload() payload: CreateCartMicroserviceDto,
  ): Promise<CreateOrderResponseDto> {
    return this.cartService.update(payload.id, payload);
  }

  @MessagePattern(OrderCommands.CartDelete)
  public async delete(@Payload() id: number): Promise<null> {
    return this.cartService.delete(id);
  }

  @MessagePattern(OrderCommands.CartRead)
  public async read(@Payload() id: number): Promise<ReadOrderResponseDto> {
    return this.cartService.read(id);
  }
}
