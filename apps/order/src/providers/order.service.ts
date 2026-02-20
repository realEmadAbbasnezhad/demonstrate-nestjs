import { Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
  CreateShippingDto,
  CreateShippingResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';

@Injectable()
export class OrderService {
  public async create(
    id: number,
    body: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return Promise.resolve(body);
  }

  public async createShipping(
    id: number,
    body: CreateShippingDto,
  ): Promise<CreateShippingResponseDto> {
    return Promise.resolve(body);
  }

  public async read(id: number): Promise<ReadOrderResponseDto> {
    return Promise.resolve(id);
  }

  public async delete(id: number): Promise<null> {
    return Promise.resolve(null);
  }
}
