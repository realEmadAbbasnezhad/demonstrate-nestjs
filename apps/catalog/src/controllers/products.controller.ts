import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  type UpdateProductMicroserviceDto,
} from '@contracts/microservice/catalog/products.dto';
import { CatalogCommands } from '@contracts/microservice/catalog/catalog.commands';
import { ProductsService } from '@catalog/providers/products.service';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern(CatalogCommands.ProductsCreate)
  create(
    @Payload() payload: CreateProductDto,
  ): Promise<FindProductResponseDto> {
    return this.productsService.create(payload);
  }

  @MessagePattern(CatalogCommands.ProductsGet)
  find(id: string): Promise<FindProductResponseDto> {
    return this.productsService.find(id);
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
    return this.productsService.update(Number(payload.id), payload);
  }

  @MessagePattern(CatalogCommands.ProductsDelete)
  remove(id: number): Promise<null> {
    return this.productsService.remove(Number(id));
  }
}
