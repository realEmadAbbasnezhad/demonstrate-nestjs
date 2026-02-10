import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
  UpdateProductMicroserviceDto,
} from '@contracts/microservice/catalog/products.dto';
import { CatalogCommands } from '@contracts/microservice/catalog/catalog.commands';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('CATALOG_MICROSERVICE')
    private readonly catalogMicroservice: ClientProxy,
  ) {}

  public create(body: CreateProductDto): Promise<FindProductResponseDto> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsCreate, body),
    );
  }

  public search(query: SearchProductDto): Promise<SearchProductResponseDto[]> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsSearch, query),
    );
  }

  public findOne(id: string): Promise<FindProductResponseDto> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsGet, id),
    );
  }

  public update(
    id: string,
    body: UpdateProductDto,
  ): Promise<FindProductResponseDto> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsUpdate, {
        id,
        ...body,
      } as UpdateProductMicroserviceDto),
    );
  }

  public remove(id: string): Promise<void> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsDelete, id),
    );
  }
}
