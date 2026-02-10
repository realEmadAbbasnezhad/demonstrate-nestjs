import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateProductDto,
  FindProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  UpdateProductDto,
} from '@contracts/microservice/catalog/products.dto';
import { ProductsRepository } from '@catalog/repository/products.repository';
import { Prisma, Product } from '@prisma/generated/catalog';

@Injectable()
export class ProductsService extends ProductsRepository {
  constructor() {
    super();
  }

  public async create(body: CreateProductDto): Promise<FindProductResponseDto> {
    return this._createProduct({
      ...body,
      deletedAt: null,
    });
  }

  public async find(id: string): Promise<FindProductResponseDto> {
    let result: Product | null = null;
    try {
      result = await this._getProduct(id);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2023') {
          throw new BadRequestException(`Invalid product id`);
        }
        throw new InternalServerErrorException(e.meta?.message || e);
      }

      throw new InternalServerErrorException(e);
    }
    if (!result) {
      throw new NotFoundException(`Product not found`);
    }
    return result;
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
