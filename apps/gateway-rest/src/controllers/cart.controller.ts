import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  CreateCartDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';
import { CartService } from '@contracts/order/providers/cart.service';

@Controller('carts')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'add a product to someone cart' })
  @Post(':id')
  public async create(
    @Param('id') id: number,
    @Body() body: CreateCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadCartResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to add a product to cart',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can add a product to cart',
      );
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException(
        'Only admins can add a product to someone else cart',
      );

    return await this.cartService.create(id, body);
  }

  @ApiOperation({ summary: 'get someone cart' })
  @Get(':id')
  public async read(
    @Param('id') id: number,
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

  @ApiOperation({ summary: 'remove a product from someone else cart' })
  @Delete(':id')
  async removeOther(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<null> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to delete product from cart',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException(
        'Only admins can remove product from someone else cart',
      );

    return await this.cartService.delete(id);
  }
}
