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
import { AuthService } from '@contracts/auth/providers/auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
} from '@contracts/catalog/providers/products.dto';
import { ProductsService } from '@contracts/catalog/providers/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'add a new product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    type: FindProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product id',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to add a product',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins can create a new product',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product with the same field already exists',
  })
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: SearchProductResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No products found matching the search criteria',
  })
  @Get()
  async search(
    @Query() query: SearchProductDto,
  ): Promise<SearchProductResponseDto[]> {
    return this.productsService.search(query);
  }

  @ApiOperation({ summary: 'get a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: FindProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product id',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @Get(':id')
  async read(@Param('id') id: string): Promise<FindProductResponseDto> {
    return this.productsService.read(id);
  }

  @ApiOperation({ summary: 'update a product' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: FindProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No valid fields provided to update',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to update products',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins can update products',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product id',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
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
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product id',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to delete products',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins can delete products',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
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

    return this.productsService.delete(id);
  }
}
