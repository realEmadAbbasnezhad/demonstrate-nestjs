import {
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '@common/hash/hash.service';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
} from '@contracts/microservice/catalog/products.dto';
import { ProductsRepository } from '@catalog/repository/products.repository';
import { PrismaCatalogService } from '@common/prisma/prisma-catalog.service';

@Injectable()
export class ProductsService extends ProductsRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly _prismaService: PrismaCatalogService,
  ) {
    super(_prismaService);
  }

  public async create(body: CreateProductDto): Promise<FindProductResponseDto> {
    return Promise.resolve({});
  }

  public async find(id: string): Promise<FindProductResponseDto> {
    return Promise.resolve({});
  }

  public async search(
    body: SearchProductDto,
  ): Promise<SearchProductResponseDto[]> {
    return Promise.resolve({});
  }

  public async update(
    id: string,
    body: UpdateProductDto,
  ): Promise<FindProductResponseDto> {
    return Promise.resolve({});
  }

  public async remove(id: string): Promise<null> {
    return null;
  }
}
