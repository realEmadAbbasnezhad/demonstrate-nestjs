import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateProductDto,
  SearchProductDto,
  SortOrder,
  UpdateProductDto,
} from '@contracts/catalog/providers/products.dto';
import { Prisma, Product } from '@prisma/generated/catalog';
import { errors } from '@elastic/elasticsearch';
describe('ProductsService', () => {
  let service: ProductsService;
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  const mockEsService = {
    index: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    slug: 'test-product',
    description: 'This is a test product',
    price: 99999,
    stockCount: 50,
    category: 'electronics',
    tags: ['tech', 'gadget'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ElasticsearchService,
          useValue: mockEsService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService); // Initialize service

    // Mock the protected repository methods
    jest.spyOn(service as any, '_createProduct').mockResolvedValue(mockProduct);
    jest
      .spyOn(service as any, '_readProductById')
      .mockResolvedValue(mockProduct);
    jest
      .spyOn(service as any, '_readProductBySlug')
      .mockResolvedValue(mockProduct);
    jest.spyOn(service as any, '_updateProduct').mockResolvedValue(mockProduct);
    jest.spyOn(service as any, '_deleteProduct').mockResolvedValue(mockProduct);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'This is a test product',
      price: 99999,
      stockCount: 50,
      category: 'electronics',
      tags: ['tech', 'gadget'],
    };
    it('should create a product successfully', async () => {
      mockEsService.index.mockResolvedValue({ result: 'created' });
      const result = await service.create(createProductDto);
      expect(service['_createProduct']).toHaveBeenCalledWith({
        ...createProductDto,
        deletedAt: null,
      });
      expect(mockEsService.index).toHaveBeenCalledWith({
        index: 'products',
        id: mockProduct.id,
        document: mockProduct,
      });
      expect(result).toEqual(mockProduct);
    });
    it('should throw BadRequestException for invalid product id (P2023)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Invalid ID',
        {
          code: 'P2023',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_createProduct')
        .mockRejectedValue(prismaError);
      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createProductDto)).rejects.toThrow(
        'Invalid product id',
      );
      expect(mockEsService.index).not.toHaveBeenCalled();
    });
    it('should throw ConflictException for duplicate field (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['slug'] },
        },
      );
      jest
        .spyOn(service as any, '_createProduct')
        .mockRejectedValue(prismaError);
      await expect(service.create(createProductDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createProductDto)).rejects.toThrow(
        'Product with the same field already exists: slug',
      );
      expect(mockEsService.index).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for other Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
          meta: { message: 'Database connection failed' },
        },
      );
      jest
        .spyOn(service as any, '_createProduct')
        .mockRejectedValue(prismaError);
      await expect(service.create(createProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockEsService.index).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for non-Prisma errors', async () => {
      jest
        .spyOn(service as any, '_createProduct')
        .mockRejectedValue(new Error('Unknown error'));
      await expect(service.create(createProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockEsService.index).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException when result is null', async () => {
      jest.spyOn(service as any, '_createProduct').mockResolvedValue(null);
      await expect(service.create(createProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(createProductDto)).rejects.toThrow(
        'Failed to create product',
      );
      expect(mockEsService.index).not.toHaveBeenCalled();
    });
  });
  describe('read', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    it('should return cached product if available', async () => {
      mockCacheManager.get.mockResolvedValue(mockProduct);
      const result = await service.read(productId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`product.${productId}`);
      expect(result).toEqual(mockProduct);
      expect(service['_readProductById']).not.toHaveBeenCalled();
    });
    it('should read product by id and cache it', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const result = await service.read(productId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`product.${productId}`);
      expect(service['_readProductById']).toHaveBeenCalledWith(productId);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `product.${productId}`,
        mockProduct,
      );
      expect(result).toEqual(mockProduct);
    });
    it('should fallback to slug search when id is invalid (P2023)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Invalid ID',
        {
          code: 'P2023',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      jest
        .spyOn(service as any, '_readProductBySlug')
        .mockResolvedValue(mockProduct);
      const result = await service.read('test-product');
      expect(service['_readProductById']).toHaveBeenCalledWith('test-product');
      expect(service['_readProductBySlug']).toHaveBeenCalledWith(
        'test-product',
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'product.test-product',
        mockProduct,
      );
      expect(result).toEqual(mockProduct);
    });
    it('should throw BadRequestException when both id and slug are invalid', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Invalid ID',
        {
          code: 'P2023',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      jest
        .spyOn(service as any, '_readProductBySlug')
        .mockRejectedValue(prismaError);
      await expect(service.read('invalid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.read('invalid')).rejects.toThrow(
        'Invalid product id',
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when slug search returns null', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Invalid ID',
        {
          code: 'P2023',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      jest.spyOn(service as any, '_readProductBySlug').mockResolvedValue(null);
      await expect(service.read('test-product')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.read('test-product')).rejects.toThrow(
        'Product not found',
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when product not found (P2025)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      await expect(service.read(productId)).rejects.toThrow(NotFoundException);
      await expect(service.read(productId)).rejects.toThrow(
        'Product not found',
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for other Prisma errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
          meta: { message: 'Database connection failed' },
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      await expect(service.read(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for non-Prisma errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(new Error('Unknown error'));
      await expect(service.read(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when result is null', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      jest.spyOn(service as any, '_readProductById').mockResolvedValue(null);
      await expect(service.read(productId)).rejects.toThrow(NotFoundException);
      await expect(service.read(productId)).rejects.toThrow(
        'Product not found',
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
  });
  describe('search', () => {
    const mockSearchResults = {
      hits: {
        total: { value: 2, relation: 'eq' },
        hits: [
          {
            _source: {
              id: '1',
              name: 'Product 1',
              slug: 'product-1',
              price: 10000,
              category: 'electronics',
              tags: ['tech'],
            },
          },
          {
            _source: {
              id: '2',
              name: 'Product 2',
              slug: 'product-2',
              price: 20000,
              category: 'electronics',
              tags: ['gadget'],
            },
          },
        ],
      },
    };
    it('should search products with query string', async () => {
      const searchDto: SearchProductDto = {
        q: 'test',
      };
      mockEsService.search.mockResolvedValue(mockSearchResults);
      const result = await service.search(searchDto);
      expect(mockEsService.search).toHaveBeenCalledWith({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: 'test',
                    fields: ['name', 'category', 'tags'],
                  },
                },
              ],
              filter: [],
            },
          },
          from: 0,
          size: undefined,
          sort: undefined,
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Product 1');
    });
    it('should search products with category filter', async () => {
      const searchDto: SearchProductDto = {
        category: 'electronics',
      };
      mockEsService.search.mockResolvedValue(mockSearchResults);
      const result = await service.search(searchDto);
      expect(mockEsService.search).toHaveBeenCalledWith({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [],
              filter: [{ term: { category: 'electronics' } }],
            },
          },
          from: 0,
          size: undefined,
          sort: undefined,
        },
      });
      expect(result).toHaveLength(2);
    });
    it('should search products with tags filter', async () => {
      const searchDto: SearchProductDto = {
        tags: ['tech', 'gadget'],
      };
      mockEsService.search.mockResolvedValue(mockSearchResults);
      const result = await service.search(searchDto);
      expect(mockEsService.search).toHaveBeenCalledWith({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [],
              filter: [{ terms: { tags: ['tech', 'gadget'] } }],
            },
          },
          from: 0,
          size: undefined,
          sort: undefined,
        },
      });
      expect(result).toHaveLength(2);
    });
    it('should search products with pagination', async () => {
      const searchDto: SearchProductDto = {
        page: 2,
        limit: 20,
      };
      mockEsService.search.mockResolvedValue(mockSearchResults);
      const result = await service.search(searchDto);
      expect(mockEsService.search).toHaveBeenCalledWith({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [],
              filter: [],
            },
          },
          from: 20,
          size: 20,
          sort: undefined,
        },
      });
      expect(result).toHaveLength(2);
    });
    it('should search products with sorting', async () => {
      const searchDto: SearchProductDto = {
        sortField: 'price',
        sortOrder: SortOrder.desc,
      };
      mockEsService.search.mockResolvedValue(mockSearchResults);
      const result = await service.search(searchDto);
      expect(mockEsService.search).toHaveBeenCalledWith({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [],
              filter: [],
            },
          },
          from: 0,
          size: undefined,
          sort: [
            {
              price: {
                order: 'desc',
              },
            },
          ],
        },
      });
      expect(result).toHaveLength(2);
    });
    it('should search products with all filters combined', async () => {
      const searchDto: SearchProductDto = {
        q: 'laptop',
        category: 'electronics',
        tags: ['tech'],
        page: 1,
        limit: 10,
        sortField: 'price',
        sortOrder: SortOrder.asc,
      };
      mockEsService.search.mockResolvedValue(mockSearchResults);
      const result = await service.search(searchDto);
      expect(mockEsService.search).toHaveBeenCalledWith({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: 'laptop',
                    fields: ['name', 'category', 'tags'],
                  },
                },
              ],
              filter: [
                { term: { category: 'electronics' } },
                { terms: { tags: ['tech'] } },
              ],
            },
          },
          from: 0,
          size: 10,
          sort: [
            {
              price: {
                order: 'asc',
              },
            },
          ],
        },
      });
      expect(result).toHaveLength(2);
    });
    it('should throw NotFoundException when no products found', async () => {
      const searchDto: SearchProductDto = {
        q: 'nonexistent',
      };
      mockEsService.search.mockResolvedValue({
        hits: {
          total: { value: 0, relation: 'eq' },
          hits: [],
        },
      });
      await expect(service.search(searchDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.search(searchDto)).rejects.toThrow(
        'No products found matching the search criteria',
      );
    });
    it('should throw InternalServerErrorException for Elasticsearch ResponseError', async () => {
      const searchDto: SearchProductDto = {
        q: 'test',
      };
      const esError = new errors.ResponseError({
        body: { error: 'Search failed' },
        statusCode: 500,
        headers: {},
        warnings: [],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        meta: {} as any,
      });
      mockEsService.search.mockRejectedValue(esError);
      await expect(service.search(searchDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
    it('should rethrow HttpException errors', async () => {
      const searchDto: SearchProductDto = {
        q: 'test',
      };
      const httpError = new BadRequestException('Invalid search query');
      mockEsService.search.mockRejectedValue(httpError);
      await expect(service.search(searchDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.search(searchDto)).rejects.toThrow(
        'Invalid search query',
      );
    });
    it('should throw InternalServerErrorException for other errors', async () => {
      const searchDto: SearchProductDto = {
        q: 'test',
      };
      mockEsService.search.mockRejectedValue(new Error('Unknown error'));
      await expect(service.search(searchDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
  describe('update', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 79999,
    };
    it('should update product successfully', async () => {
      mockEsService.update.mockResolvedValue({ result: 'updated' });
      const result = await service.update(productId, updateDto);
      expect(service['_updateProduct']).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
      expect(mockEsService.update).toHaveBeenCalledWith({
        index: 'products',
        id: productId,
        doc: updateDto,
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith(`product.${productId}`);
      expect(result).toEqual(mockProduct);
    });
    it('should throw BadRequestException for invalid product id (P2023)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Invalid ID',
        {
          code: 'P2023',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_updateProduct')
        .mockRejectedValue(prismaError);
      await expect(service.update(productId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(productId, updateDto)).rejects.toThrow(
        'Invalid product id',
      );
      expect(mockEsService.update).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for other Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
          meta: { message: 'Database connection failed' },
        },
      );
      jest
        .spyOn(service as any, '_updateProduct')
        .mockRejectedValue(prismaError);
      await expect(service.update(productId, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockEsService.update).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for non-Prisma errors', async () => {
      jest
        .spyOn(service as any, '_updateProduct')
        .mockRejectedValue(new Error('Unknown error'));
      await expect(service.update(productId, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockEsService.update).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when result is null', async () => {
      jest.spyOn(service as any, '_updateProduct').mockResolvedValue(null);
      await expect(service.update(productId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(productId, updateDto)).rejects.toThrow(
        'Product not found',
      );
      expect(mockEsService.update).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
  });
  describe('delete', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    it('should delete product successfully', async () => {
      mockEsService.delete.mockResolvedValue({ result: 'deleted' });
      const result = await service.delete(productId);
      expect(service['_readProductById']).toHaveBeenCalledWith(productId);
      expect(service['_deleteProduct']).toHaveBeenCalledWith(productId);
      expect(mockEsService.delete).toHaveBeenCalledWith({
        index: 'products',
        id: productId,
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith(`product.${productId}`);
      expect(result).toBeNull();
    });
    it('should throw NotFoundException when product is null', async () => {
      jest.spyOn(service as any, '_readProductById').mockResolvedValue(null);
      await expect(service.delete(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(productId)).rejects.toThrow(
        'Product not found',
      );
      expect(service['_deleteProduct']).not.toHaveBeenCalled();
      expect(mockEsService.delete).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when product is already deleted', async () => {
      jest.spyOn(service as any, '_readProductById').mockResolvedValue({
        ...mockProduct,
        deletedAt: new Date(),
      });
      await expect(service.delete(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(productId)).rejects.toThrow(
        'Product not found',
      );
      expect(service['_deleteProduct']).not.toHaveBeenCalled();
      expect(mockEsService.delete).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException for invalid product id (P2023)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Invalid ID',
        {
          code: 'P2023',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      await expect(service.delete(productId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.delete(productId)).rejects.toThrow(
        'Invalid product id',
      );
      expect(service['_deleteProduct']).not.toHaveBeenCalled();
      expect(mockEsService.delete).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException when product not found (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      await expect(service.delete(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(productId)).rejects.toThrow(
        'Product not found',
      );
      expect(service['_deleteProduct']).not.toHaveBeenCalled();
      expect(mockEsService.delete).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for other Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
          meta: { message: 'Database connection failed' },
        },
      );
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(prismaError);
      await expect(service.delete(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(service['_deleteProduct']).not.toHaveBeenCalled();
      expect(mockEsService.delete).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException for non-Prisma errors', async () => {
      jest
        .spyOn(service as any, '_readProductById')
        .mockRejectedValue(new Error('Unknown error'));
      await expect(service.delete(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(service['_deleteProduct']).not.toHaveBeenCalled();
      expect(mockEsService.delete).not.toHaveBeenCalled();
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
  });
});
