import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateOrderDto,
  CreateOrderMicroserviceDto,
  CreateOrderResponseDto,
  CreateShippingDto,
  CreateShippingMicroserviceDto,
  CreateShippingResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';
import { firstValueFrom } from 'rxjs';
import { OrderCommands } from '@contracts/order/order.commands';

@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_MICROSERVICE')
    private readonly orderMicroservice: ClientProxy,
  ) {}

  public create(
    id: number,
    body: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.OrderCreate, {
        ...body,
        id,
      } as CreateOrderMicroserviceDto),
    );
  }

  public createShipping(
    id: number,
    body: CreateShippingDto,
  ): Promise<CreateShippingResponseDto> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.OrderShipping, {
        ...body,
        id,
      } as CreateShippingMicroserviceDto),
    );
  }

  public read(id: number): Promise<ReadOrderResponseDto> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.OrderRead, id),
    );
  }

  public delete(id: number): Promise<null> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.OrderDelete, id),
    );
  }
}
