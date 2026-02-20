import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  ReadOrderResponseDto,
  CreateOrderDto,
  CreateOrderResponseDto,
  CreateShippingDto,
  CreateShippingResponseDto,
} from '@contracts/order/providers/order.dto';
import { OrderService } from '@contracts/order/providers/order.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Resolver()
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => CreateOrderResponseDto, { name: 'createOrder' })
  public async create(
    @Args('id') id: number,
    @Args('body') body: CreateOrderDto,
    @Auth() auth: AuthParamDto,
  ): Promise<CreateOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to reserve a cart',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can reserve cart',
      );
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can reserve someone else cart');

    return await this.orderService.create(id, body);
  }

  @Mutation(() => CreateShippingResponseDto, { name: 'createShipping' })
  public async createShipping(
    @Args('id') id: number,
    @Args('body') body: CreateShippingDto,
    @Auth() auth: AuthParamDto,
  ): Promise<CreateShippingResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to set shipping info',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can set shipping info',
      );
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException(
        'Only admins can set someone else shipping info',
      );

    return await this.orderService.createShipping(id, body);
  }

  @Query(() => ReadOrderResponseDto, { name: 'readOrder' })
  public async read(
    @Args('adminAttention') adminAttention: boolean,
    @Args('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to get a order');
    if (processedAuth.role !== $Enums.Role.ADMIN && adminAttention)
      throw new ForbiddenException(
        'Only admins can get orders that need admin attention',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a order');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can get someone else order');

    return this.orderService.read(id);
  }

  @Mutation(() => Boolean, { name: 'deleteOrder' })
  public async delete(
    @Args('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<boolean> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to cancel order');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException(
        'Only admins can cancel order from someone else',
      );

    await this.orderService.delete(id);
    return true;
  }
}
