import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from '@contracts/auth/providers/auth.service';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import { $Enums } from '@prisma/generated/auth';
import {
  CreateProductDto,
  ReadProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
} from '@contracts/catalog/providers/products.dto';
import { ProductsService } from '@contracts/catalog/providers/products.service';

@Resolver(() => ReadProductResponseDto)
export class ProductResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => ReadProductResponseDto)
  public async productCreate(
    @Args('input') input: CreateProductDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadProductResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to set add a product',
      );
    if (processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('Only admins can create a new product');

    return this.productsService.create(input);
  }

  @Query(() => [SearchProductResponseDto])
  public async productSearch(
    @Args('input') input: SearchProductDto,
  ): Promise<SearchProductResponseDto[]> {
    return this.productsService.search(input);
  }

  @Query(() => ReadProductResponseDto)
  public async productRead(
    @Args('id') id: string,
  ): Promise<ReadProductResponseDto> {
    return this.productsService.read(id);
  }

  @Mutation(() => ReadProductResponseDto)
  public async productUpdate(
    @Args('id') id: string,
    @Args('input') body: UpdateProductDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadProductResponseDto> {
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

  @Mutation(() => Boolean)
  public async productDelete(
    @Args('id') id: string,
    @Auth() auth: AuthParamDto,
  ): Promise<boolean> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException(
        'you must be logged in to delete products',
      );
    if (processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('only admins can delete products');

    await this.productsService.delete(id);
    return true;
  }
}
