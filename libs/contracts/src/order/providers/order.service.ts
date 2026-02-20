import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GetOrderResponseDto,
  ReserveCartDto,
  ReserveCartResponseDto,
  ShippingInfoDto,
  ShippingInfoResponseDto,
} from '@contracts/microservice/order/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_MICROSERVICE')
    private readonly orderMicroservice: ClientProxy,
  ) {}

  public reserve(
    id: number,
    body: ReserveCartDto,
  ): Promise<ReserveCartResponseDto> {
    return Promise.resolve(body);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }

  public shipping(
    id: number,
    body: ShippingInfoDto,
  ): Promise<ShippingInfoResponseDto> {
    return Promise.resolve(body);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }

  public get(id: number): Promise<GetOrderResponseDto> {
    return Promise.resolve(id);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }

  public cancel(id: number): Promise<GetOrderResponseDto> {
    return Promise.resolve(id);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }

  public adminAttention(): Promise<GetOrderResponseDto[]> {
    return Promise.resolve([]);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }

  public adminAttentionOne(id: number): Promise<GetOrderResponseDto> {
    return Promise.resolve(id);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }
}
