import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  UpdateCartDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';
import { CartService } from '@contracts/order/providers/cart.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Resolver('Cart')
export class CartResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => [ReadCartResponseDto], { name: 'updateCart' })
  public async update(
    @Args('id') id: number,
    @Args('updateCartInput') body: UpdateCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadCartResponseDto[]> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to set quantity of a product',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can set quantity of a product',
      );
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException(
        'Only admins can set quantity of a product for someone else',
      );

    return await this.cartService.update(id, body);
  }

  @Query(() => [ReadCartResponseDto], { name: 'getCart' })
  public async read(
    @Args('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadCartResponseDto[]> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to get a cart');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can get someone else cart');

    return await this.cartService.read(id);
  }

  @Mutation(() => Boolean, { name: 'deleteCart' })
  async delete(
    @Args('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<boolean> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to delete cart');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can remove someone else cart');

    await this.cartService.delete(id);
    return true;
  }
}
