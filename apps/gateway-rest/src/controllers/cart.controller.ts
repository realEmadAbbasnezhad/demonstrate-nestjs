import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  UpdateCartDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';
import { CartService } from '@contracts/order/providers/cart.service';

@Controller('carts')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'set quantity of a product' })
  @Patch(':id')
  public async update(
    @Param('id') id: number,
    @Body() body: UpdateCartDto,
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

  @ApiOperation({ summary: 'get the full cart' })
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

  @ApiOperation({ summary: 'remove the whole cart' })
  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<null> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to delete cart');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can remove someone else cart');

    return await this.cartService.delete(id);
  }
}
