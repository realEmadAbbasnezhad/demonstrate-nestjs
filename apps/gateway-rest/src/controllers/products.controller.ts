import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@gateway-rest/providers/auth/auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Auth } from '@gateway-rest/providers/auth/auth.decorator';
import type { AuthParamDto } from '@contracts/microservice/auth/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import { ProductsService } from '@gateway-rest/providers/products.service';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
} from '@contracts/microservice/catalog/products.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'add a new product' })
  @Post()
  async create(
    @Body() body: CreateProductDto,
    @Auth() auth: AuthParamDto,
  ): Promise<FindProductResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to set add a product',
      );
    if (processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can create a new product');

    return this.productsService.create(body);
  }

  @ApiOperation({ summary: 'search between products' })
  @Get()
  async search(
    @Query() query: SearchProductDto,
  ): Promise<SearchProductResponseDto[]> {
    return this.productsService.search(query);
  }

  @ApiOperation({ summary: 'get a product' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'update a product' })
  @ApiBody({ type: UpdateProductDto })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @Auth() auth: AuthParamDto,
  ): Promise<FindProductResponseDto> {
    if (!body) throw new BadRequestException('no data provided to update');
    if (
      !body.name &&
      !body.slug &&
      !body.description &&
      !body.price &&
      !body.stockCount &&
      !body.category &&
      !body.tags
    )
      throw new BadRequestException('no valid fields provided to update');

    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to update products',
      );
    if (processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('only admins can update products');

    return this.productsService.update(id, body);
  }

  @ApiOperation({ summary: 'delete a product' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Auth() auth: AuthParamDto,
  ): Promise<void> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to delete products',
      );
    if (processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('only admins can delete products');

    return this.productsService.remove(id);
  }
}
