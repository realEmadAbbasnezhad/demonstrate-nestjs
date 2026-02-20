import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateProductDto,
  ReadProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
  UpdateProductMicroserviceDto,
} from './products.dto';
import { CatalogCommands } from '@contracts/catalog/catalog.commands';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('CATALOG_MICROSERVICE')
    private readonly catalogMicroservice: ClientProxy,
  ) {}

  public async create(body: CreateProductDto): Promise<ReadProductResponseDto> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsCreate, body),
    );
  }

  public search(query: SearchProductDto): Promise<SearchProductResponseDto[]> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsSearch, query),
    );
  }

  public read(id: string): Promise<ReadProductResponseDto> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsRead, id),
    );
  }

  public update(
    id: string,
    body: UpdateProductDto,
  ): Promise<ReadProductResponseDto> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsUpdate, {
        id,
        ...body,
      } as UpdateProductMicroserviceDto),
    );
  }

  public delete(id: string): Promise<void> {
    return firstValueFrom(
      this.catalogMicroservice.send(CatalogCommands.ProductsDelete, id),
    );
  }
}
