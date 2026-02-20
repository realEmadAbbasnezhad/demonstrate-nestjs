import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderCommands } from '@contracts/order/order.commands';
import { CartService } from '@order/providers/cart.service';
import {
  CreateCartMicroserviceDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern(OrderCommands.CartUpdate)
  public async update(
    @Payload() payload: CreateCartMicroserviceDto,
  ): Promise<ReadCartResponseDto> {
    return this.cartService.update(Number(payload.id), payload);
  }

  @MessagePattern(OrderCommands.CartDelete)
  public async delete(@Payload() id: number): Promise<null> {
    return this.cartService.delete(Number(id));
  }

  @MessagePattern(OrderCommands.CartRead)
  public async read(@Payload() id: number): Promise<ReadCartResponseDto> {
    return this.cartService.read(Number(id));
  }
}
