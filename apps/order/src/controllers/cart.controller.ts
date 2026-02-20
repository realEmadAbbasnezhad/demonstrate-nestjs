import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderCommands } from '@contracts/order/order.commands';
import {
  CreateOrderResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';
import { CreateCartMicroserviceDto } from '@contracts/order/providers/cart.dto';

@Controller()
export class CartController {
  //constructor(private readonly orderService: OrderService) {}

  @MessagePattern(OrderCommands.CartUpdate)
  public async update(
    @Payload() payload: CreateCartMicroserviceDto,
  ): Promise<CreateOrderResponseDto> {
    return Promise.resolve(payload);
  }

  @MessagePattern(OrderCommands.CartDelete)
  public async delete(@Payload() id: number): Promise<null> {
    return Promise.resolve(null);
  }

  @MessagePattern(OrderCommands.CartRead)
  public async read(@Payload() id: number): Promise<ReadOrderResponseDto[]> {
    return Promise.resolve([]);
  }
}
