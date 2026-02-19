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
  AdminAttentionDto,
  AdminAttentionResponseDto,
  GetOrderResponseDto,
  ReserveCartDto,
  ReserveCartResponseDto,
  ShippingInfoDto,
  ShippingInfoResponseDto,
} from '@contracts/microservice/order/order.dto';
import { OrderService } from '@gateway-rest/providers/order.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'reserve a cart to order' })
  @Post('reserve')
  async reserve(
    @Body() body: ReserveCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReserveCartResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to reserve cart');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can reserve cart',
      );

    return this.orderService.reserve(processedAuth.id, body);
  }
  @ApiOperation({ summary: 'reserve someone else cart' })
  @Post('reserve/:id')
  async addOther(
    @Param('id') id: number,
    @Body() body: ReserveCartDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReserveCartResponseDto> {
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

    return this.orderService.reserve(id, body);
  }

  @ApiOperation({ summary: 'get shipping info to order' })
  @Post('shipping')
  async shipping(
    @Body() body: ShippingInfoDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ShippingInfoResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to set shipping info',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can set shipping info',
      );

    return this.orderService.reserve(processedAuth.id, body);
  }
  @ApiOperation({ summary: 'set shipping someone else shipping info' })
  @Post('shipping/:id')
  async shippingOther(
    @Param('id') id: number,
    @Body() body: ShippingInfoDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ShippingInfoResponseDto> {
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

    return this.orderService.shipping(id, body);
  }

  @ApiOperation({ summary: 'get status of your order' })
  @Get()
  async find(@Auth() auth: AuthParamDto): Promise<GetOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to get a order');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a order');

    return this.orderService.get(processedAuth.id);
  }
  @ApiOperation({ summary: 'get status of someone else order' })
  @Get(':id')
  async findOther(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<GetOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to get a order');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a order');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can get someone else order');

    return this.orderService.get(id);
  }

  @ApiOperation({ summary: 'cancel a order' })
  @Delete()
  async cancel(@Auth() auth: AuthParamDto): Promise<GetOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to cancel order');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException(
        'Only customers and admins can cancel order',
      );

    return this.orderService.cancel(processedAuth.id);
  }
  @ApiOperation({ summary: 'cancel a order from someone else' })
  @Delete(':id')
  async cancelOther(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<GetOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to cancel order');
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only customers and admins can get a cart');
    if (id != processedAuth.id && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException(
        'Only admins can cancel order from someone else',
      );

    return this.orderService.cancel(id);
  }

  @ApiOperation({ summary: 'get a list of orders that need admin attention' })
  @Get('admin')
  async adminAttention(
    @Auth() auth: AuthParamDto,
  ): Promise<GetOrderResponseDto[]> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to get admin attentions',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only admins can get admin attentions');

    return this.orderService.adminAttention();
  }
  @ApiOperation({ summary: 'get a orders that need admin attention' })
  @Get('admin/:id')
  async adminAttentionOne(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<GetOrderResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to get admin attentions',
      );
    if (processedAuth.role == $Enums.Role.ANONYMOUS)
      throw new ForbiddenException('Only admins can get admin attentions');

    return this.orderService.adminAttentionOne(id);
  }

  @ApiOperation({ summary: 'respond to admin attention' })
  @Post('admin/:id')
  async adminAttentionResponse(
    @Param('id') id: number,
    @Body() body: AdminAttentionDto,
    @Auth() auth: AuthParamDto,
  ): Promise<AdminAttentionResponseDto> {
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

    return this.orderService.shipping(id, body);
  }
}
