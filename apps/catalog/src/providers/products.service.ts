import {
  BadRequestException,
  ConflictException,
  HttpException,
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
} from '@contracts/catalog/providers/products.dto';
import { ProductsRepository } from '@catalog/repository/products.repository';
import { Prisma, Product } from '@prisma/generated/catalog';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { SearchTotalHits } from '@elastic/elasticsearch/api/types';

@Injectable()
export class ProductsService extends ProductsRepository {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly esService: ElasticsearchService,
  ) {
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

    await this.esService.index({
      index: 'products',
      id: result.id,
      document: result,
    });
    return result;
  }

  public async read(id: string): Promise<FindProductResponseDto> {
    const cache = await this.cacheManager.get<FindProductResponseDto>(
      `product.${id}`,
    );
    if (cache) return cache;

    let result: Product | null = null;
    try {
      result = await this._readProductById(id);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2023') {
          try {
            result = await this._readProductBySlug(id);
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              throw new BadRequestException(`Invalid product id`);
            }

            throw new InternalServerErrorException(e);
          }

          if (!result) {
            throw new NotFoundException(`Product not found`);
          }

          await this.cacheManager.set(`product.${id}`, result);
          return result;
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
    const searchQuery: any = {
      index: 'products',
      body: {
        query: {
          bool: {
            must: body.q
              ? [
                  {
                    multi_match: {
                      query: body.q,
                      fields: ['name', 'category', 'tags'],
                    },
                  },
                ]
              : [],
            filter: [
              ...(body.category ? [{ term: { category: body.category } }] : []),
              ...(body.tags && body.tags.length > 0
                ? [{ terms: { tags: body.tags } }]
                : []),
            ],
          },
        },
        from: ((body.page ?? 1) - 1) * (body.limit ?? 10),
        size: body.limit,
        sort: body.sortField
          ? [
              {
                [body.sortField]: {
                  order: body.sortOrder || 'asc',
                },
              },
            ]
          : undefined,
      },
    };

    try {
      const result =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.esService.search<SearchProductResponseDto>(searchQuery);
      if ((result.hits.total as SearchTotalHits).value == 0)
        throw new NotFoundException(
          `No products found matching the search criteria`,
        );
      return result.hits.hits.map((hit) => hit._source!) ?? [];
    } catch (e) {
      if (e instanceof errors.ResponseError) {
        throw new InternalServerErrorException(e.message);
      }
      if (e instanceof HttpException) {
        throw e;
      }

      throw new InternalServerErrorException(e);
    }
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

    await this.esService.update({
      index: 'products',
      id: id,
      doc: body,
    });
    await this.cacheManager.del(`product.${id}`);
    return result;
  }

  public async delete(id: string): Promise<null> {
    try {
      const resalt = await this._readProductById(id);
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

    await this.esService.delete({
      index: 'products',
      id: id,
    });
    await this.cacheManager.del(`product.${id}`);
    return null;
  }
}
