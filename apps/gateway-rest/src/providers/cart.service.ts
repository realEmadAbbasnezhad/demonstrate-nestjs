import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AddCartDto,
  AddCartResponseDto,
  DeleteCartDto,
  FindCartResponseDto,
} from '@contracts/microservice/order/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject('ORDER_MICROSERVICE')
    private readonly orderMicroservice: ClientProxy,
  ) {}

  public add(id: number, body: AddCartDto): Promise<AddCartResponseDto> {
    return Promise.resolve(body);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartCreate, body),
    //);
  }

  public find(id: number): Promise<FindCartResponseDto> {
    return Promise.resolve(id);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartGet, id),
    //);
  }

  public remove(id: number, body: DeleteCartDto): Promise<FindCartResponseDto> {
    return Promise.resolve(body);
    //return firstValueFrom(
    //  this.catalogMicroservice.send(OrderCommands.CartDelete, id),
    //);
  }
}
