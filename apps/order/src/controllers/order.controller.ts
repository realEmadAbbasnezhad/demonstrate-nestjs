import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderCommands } from '@contracts/order/order.commands';
import {
  CreateOrderMicroserviceDto,
  CreateOrderResponseDto,
  CreateShippingMicroserviceDto,
  CreateShippingResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';

@Controller()
export class OrderController {
  //constructor(private readonly orderService: OrderService) {}

  @MessagePattern(OrderCommands.OrderCreate)
  public async create(
    @Payload() payload: CreateOrderMicroserviceDto,
  ): Promise<CreateOrderResponseDto> {
    return Promise.resolve(payload);
  }

  @MessagePattern(OrderCommands.OrderShipping)
  public async createShipping(
    @Payload() payload: CreateShippingMicroserviceDto,
  ): Promise<CreateShippingResponseDto> {
    return Promise.resolve(payload);
  }

  @MessagePattern(OrderCommands.OrderRead)
  public async read(@Payload() id: number): Promise<ReadOrderResponseDto> {
    return Promise.resolve({});
  }

  @MessagePattern(OrderCommands.OrderDelete)
  public async delete(@Payload() id: number): Promise<null> {
    return Promise.resolve(null);
  }
}
