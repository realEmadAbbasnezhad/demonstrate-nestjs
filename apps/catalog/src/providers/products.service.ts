import {
  BadRequestException,
  ConflictException,
  Inject,
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductsService extends ProductsRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super();
  }

  public async create(body: CreateProductDto): Promise<FindProductResponseDto> {
    let result: Product | null = null;
    try {
      result = await this._createProduct({
        ...body,
        deletedAt: null,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2023') {
          throw new BadRequestException(`Invalid product id`);
        }
        if (e.code == 'P2002') {
          throw new ConflictException(
            `Product with the same field already exists: ${(e.meta?.target as string) || 'unknown'}`,
          );
        }
        throw new InternalServerErrorException(e.meta?.message || e);
      }
      throw new InternalServerErrorException(e);
    }
    if (!result) {
      throw new InternalServerErrorException(`Failed to create product`);
    }
    return result;
  }

  public async find(id: string): Promise<FindProductResponseDto> {
    const cache = await this.cacheManager.get<FindProductResponseDto>(
      `product.${id}`,
    );
    if (cache) return cache;

    let result: Product | null = null;
    try {
      result = await this._getProduct(id);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2023') {
          throw new BadRequestException(`Invalid product id`);
        }
        if (e.code == 'P2025') {
          throw new NotFoundException(`Product not found`);
        }

        throw new InternalServerErrorException(e.meta?.message || e);
      }

      throw new InternalServerErrorException(e);
    }
    if (!result) {
      throw new NotFoundException(`Product not found`);
    }

    await this.cacheManager.set(`product.${id}`, result);
    return result;
  }

  public async search(
    body: SearchProductDto,
  ): Promise<SearchProductResponseDto[]> {
    return Promise.resolve({});
  }

  public async update(
    id: string,
    body: Omit<UpdateProductDto, 'id'>,
  ): Promise<FindProductResponseDto> {
    let result: Product | null = null;
    try {
      result = await this._updateProduct(id, body);
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

    await this.cacheManager.del(`product.${id}`);
    return result;
  }

  public async remove(id: string): Promise<null> {
    try {
      const resalt = await this._getProduct(id);
      if (resalt == null || resalt.deletedAt != null) {
        throw new Prisma.PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '',
        });
      }
      await this._deleteProduct(id);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2023') {
          throw new BadRequestException(`Invalid product id`);
        }
        if (e.code == 'P2025') {
          throw new NotFoundException(`Product not found`);
        }

        throw new InternalServerErrorException(e.meta?.message || e);
      }

      throw new InternalServerErrorException(e);
    }

    await this.cacheManager.del(`product.${id}`);
    return null;
  }
}
