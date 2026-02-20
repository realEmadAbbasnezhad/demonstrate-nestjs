import { Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';

@Injectable()
export class CartService {
  public async update(
    id: number,
    body: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return Promise.resolve(body);
  }

  public async delete(id: number): Promise<null> {
    return Promise.resolve(null);
  }

  public async read(id: number): Promise<ReadOrderResponseDto> {
    return Promise.resolve(id);
  }
}
