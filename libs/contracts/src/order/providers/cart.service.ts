import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderCommands } from '@contracts/order/order.commands';
import {
  UpdateCartDto,
  CreateCartMicroserviceDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject('ORDER_MICROSERVICE')
    private readonly orderMicroservice: ClientProxy,
  ) {}

  public update(
    id: number,
    body: UpdateCartDto,
  ): Promise<ReadCartResponseDto[]> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.CartUpdate, {
        id,
        ...body,
      } as CreateCartMicroserviceDto),
    );
  }

  public read(id: number): Promise<ReadCartResponseDto[]> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.CartRead, id),
    );
  }

  public delete(id: number): Promise<null> {
    return firstValueFrom(
      this.orderMicroservice.send(OrderCommands.CartDelete, id),
    );
  }
}
