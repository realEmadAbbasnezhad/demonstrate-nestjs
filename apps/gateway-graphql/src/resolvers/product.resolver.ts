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
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
} from '@contracts/catalog/providers/products.dto';
import { ProductsService } from '@contracts/catalog/providers/products.service';

@Resolver(() => FindProductResponseDto)
export class ProductResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => FindProductResponseDto)
  public async productCreate(
    @Args('input') input: CreateProductDto,
    @Auth() auth: AuthParamDto,
  ): Promise<FindProductResponseDto> {
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

  @Query(() => FindProductResponseDto)
  public async productRead(
    @Args('id') id: string,
  ): Promise<FindProductResponseDto> {
    return this.productsService.read(id);
  }

  @Mutation(() => FindProductResponseDto)
  public async productUpdate(
    @Args('id') id: string,
    @Args('input') body: UpdateProductDto,
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
