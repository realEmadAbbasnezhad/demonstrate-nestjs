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
import { AuthService } from '@gateway-rest/providers/auth/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from '@gateway-rest/providers/auth/auth.decorator';
import type { AuthParamDto } from '@contracts/microservice/auth/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import { CartService } from '@gateway-rest/providers/cart.service';
import {
  AddCartDto,
  AddCartResponseDto,
  DeleteCartDto,
  FindCartResponseDto,
} from '@contracts/microservice/order/cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'add a product to cart' })
  @Post()
  async add(
    @Body() body: AddCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<AddCartResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to add a product to cart',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can add a product to cart',
      );

    return this.cartService.add(processedAuth.id, body);
  }
  @ApiOperation({ summary: 'add a product to someone else cart' })
  @Post(':id')
  async addOther(
    @Param('id') id: number,
    @Body() body: AddCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<AddCartResponseDto> {
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

    return this.cartService.add(id, body);
  }

  @ApiOperation({ summary: 'get your cart' })
  @Get()
  async find(@Auth() auth: AuthParamDto): Promise<FindCartResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to get a cart');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');

    return this.cartService.find(processedAuth.id);
  }
  @ApiOperation({ summary: 'get someone else cart' })
  @Get(':id')
  async findOther(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<FindCartResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to get a cart');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can get someone else cart');

    return this.cartService.find(id);
  }

  @ApiOperation({ summary: 'remove a product from your cart' })
  @Delete()
  async remove(
    @Body() body: DeleteCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<FindCartResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to delete product from cart',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');

    return this.cartService.remove(processedAuth.id, body);
  }
  @ApiOperation({ summary: 'remove a product from someone else cart' })
  @Delete(':id')
  async removeOther(
    @Param('id') id: number,
    @Body() body: DeleteCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<FindCartResponseDto> {
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

    return this.cartService.remove(id, body);
  }
}
