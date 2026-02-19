import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  type UpdateProductMicroserviceDto,
} from '@contracts/catalog/providers/products.dto';
import { CatalogCommands } from '@contracts/catalog/catalog.commands';
import { ProductsService } from '@catalog/providers/products.service';
import { runtimeOmit } from '@common/utils/pick-omit';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern(CatalogCommands.ProductsCreate)
  create(
    @Payload() payload: CreateProductDto,
  ): Promise<FindProductResponseDto> {
    return this.productsService.create(payload);
  }

  @MessagePattern(CatalogCommands.ProductsRead)
  read(id: string): Promise<FindProductResponseDto> {
    return this.productsService.read(id);
  }
  @MessagePattern(CatalogCommands.ProductsSearch)
  search(
    @Payload() payload: SearchProductDto,
  ): Promise<SearchProductResponseDto[]> {
    return this.productsService.search(payload);
  }

  @MessagePattern(CatalogCommands.ProductsUpdate)
  update(
    @Payload() payload: UpdateProductMicroserviceDto,
  ): Promise<FindProductResponseDto> {
    const finalPayload = runtimeOmit(payload, ['id']);
    return this.productsService.update(payload.id, finalPayload);
  }

  @MessagePattern(CatalogCommands.ProductsDelete)
  delete(id: string): Promise<null> {
    return this.productsService.delete(id);
  }
}
