import { Test, TestingModule } from '@nestjs/testing';
import { ProductResolver } from './product.resolver';
import { ProductsService } from '@contracts/catalog/providers/products.service';
import { AuthService } from '@contracts/auth/providers/auth.service';
import {
  CreateProductDto,
  ReadProductResponseDto,
  SearchProductDto,
  SearchProductResponseDto,
  SortOrder,
  UpdateProductDto,
} from '@contracts/catalog/providers/products.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
describe('ProductResolver', () => {
  let resolver: ProductResolver;
  const mockProductsService = {
    create: jest.fn(),
    search: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockAuthService = {
    processAuthParam: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductResolver,
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();
    resolver = module.get<ProductResolver>(ProductResolver);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
  describe('productCreate', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'This is a test product description',
      price: 99999,
      stockCount: 50,
      category: 'electronics',
      tags: ['tech', 'gadget'],
    };
    const expectedResponse: ReadProductResponseDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      slug: 'test-product',
      description: 'This is a test product description',
      price: 99999,
      stockCount: 50,
      category: 'electronics',
      tags: ['tech', 'gadget'],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    it('should create a product when authenticated as admin', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.create.mockResolvedValue(expectedResponse);
      const result = await resolver.productCreate(
        createProductDto,
        'admin-token',
      );
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(expectedResponse);
    });
    it('should throw UnauthorizedException when not authenticated', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(
        resolver.productCreate(createProductDto, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'invalid-token',
      );
      expect(mockProductsService.create).not.toHaveBeenCalled();
    });
    it('should throw ForbiddenException when authenticated as non-admin', async () => {
      const customerAuth = {
        id: 2,
        username: 'customer',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(customerAuth);
      await expect(
        resolver.productCreate(createProductDto, 'customer-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'customer-token',
      );
      expect(mockProductsService.create).not.toHaveBeenCalled();
    });
    it('should throw ForbiddenException when authenticated as anonymous', async () => {
      const anonymousAuth = {
        id: 3,
        username: 'anonymous',
        role: $Enums.Role.ANONYMOUS,
      };
      mockAuthService.processAuthParam.mockResolvedValue(anonymousAuth);
      await expect(
        resolver.productCreate(createProductDto, 'anon-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockProductsService.create).not.toHaveBeenCalled();
    });
  });
  describe('productSearch', () => {
    const mockSearchResults: SearchProductResponseDto[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Product 1',
        slug: 'product-1',
        price: 10000,
        category: 'electronics',
        tags: ['tech'],
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Product 2',
        slug: 'product-2',
        price: 20000,
        category: 'electronics',
        tags: ['gadget'],
      },
    ];
    it('should search products with query string', async () => {
      const searchDto: SearchProductDto = {
        q: 'test',
      };
      mockProductsService.search.mockResolvedValue(mockSearchResults);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResults);
    });
    it('should search products with category filter', async () => {
      const searchDto: SearchProductDto = {
        category: 'electronics',
      };
      mockProductsService.search.mockResolvedValue(mockSearchResults);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResults);
    });
    it('should search products with tags filter', async () => {
      const searchDto: SearchProductDto = {
        tags: ['tech', 'gadget'],
      };
      mockProductsService.search.mockResolvedValue(mockSearchResults);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResults);
    });
    it('should search products with pagination', async () => {
      const searchDto: SearchProductDto = {
        page: 2,
        limit: 20,
      };
      mockProductsService.search.mockResolvedValue(mockSearchResults);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResults);
    });
    it('should search products with sorting', async () => {
      const searchDto: SearchProductDto = {
        sortField: 'price',
        sortOrder: SortOrder.asc,
      };
      mockProductsService.search.mockResolvedValue(mockSearchResults);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResults);
    });
    it('should search products with all filters combined', async () => {
      const searchDto: SearchProductDto = {
        q: 'laptop',
        category: 'electronics',
        tags: ['tech'],
        page: 1,
        limit: 10,
        sortField: 'price',
        sortOrder: SortOrder.desc,
      };
      mockProductsService.search.mockResolvedValue(mockSearchResults);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResults);
    });
    it('should return empty array when no products found', async () => {
      const searchDto: SearchProductDto = {
        q: 'nonexistent',
      };
      mockProductsService.search.mockResolvedValue([]);
      const result = await resolver.productSearch(searchDto);
      expect(mockProductsService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual([]);
    });
  });
  describe('productRead', () => {
    const mockProduct: ReadProductResponseDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      slug: 'test-product',
      description: 'This is a test product description',
      price: 99999,
      stockCount: 50,
      category: 'electronics',
      tags: ['tech', 'gadget'],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    it('should read a product by id', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.read.mockResolvedValue(mockProduct);
      const result = await resolver.productRead(productId);
      expect(mockProductsService.read).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });
    it('should handle reading product with different id format', async () => {
      const productId = 'abc-123-def';
      mockProductsService.read.mockResolvedValue({
        ...mockProduct,
        id: productId,
      });
      const result = await resolver.productRead(productId);
      expect(mockProductsService.read).toHaveBeenCalledWith(productId);
      expect(result.id).toBe(productId);
    });
  });
  describe('productUpdate', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 79999,
    };
    const updatedProduct: ReadProductResponseDto = {
      id: productId,
      name: 'Updated Product',
      slug: 'test-product',
      description: 'This is a test product description',
      price: 79999,
      stockCount: 50,
      category: 'electronics',
      tags: ['tech', 'gadget'],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    it('should throw BadRequestException when no data provided', async () => {
      await expect(
        resolver.productUpdate(
          productId,
          undefined as unknown as UpdateProductDto,
          'admin-token',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockProductsService.update).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException when no valid fields provided', async () => {
      const emptyDto: UpdateProductDto = {};
      await expect(
        resolver.productUpdate(productId, emptyDto, 'admin-token'),
      ).rejects.toThrow(BadRequestException);
      expect(mockProductsService.update).not.toHaveBeenCalled();
    });
    it('should throw UnauthorizedException when not authenticated', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(
        resolver.productUpdate(productId, updateProductDto, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'invalid-token',
      );
      expect(mockProductsService.update).not.toHaveBeenCalled();
    });
    it('should throw ForbiddenException when authenticated as non-admin', async () => {
      const customerAuth = {
        id: 2,
        username: 'customer',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(customerAuth);
      await expect(
        resolver.productUpdate(productId, updateProductDto, 'customer-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'customer-token',
      );
      expect(mockProductsService.update).not.toHaveBeenCalled();
    });
    it('should update product when authenticated as admin', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      const result = await resolver.productUpdate(
        productId,
        updateProductDto,
        'admin-token',
      );
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
    });
    it('should update product with only name', async () => {
      const updateDto: UpdateProductDto = {
        name: 'New Name',
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue({
        ...updatedProduct,
        name: 'New Name',
      });
      const result = await resolver.productUpdate(
        productId,
        updateDto,
        'admin-token',
      );
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
      expect(result.name).toBe('New Name');
    });
    it('should update product with only slug', async () => {
      const updateDto: UpdateProductDto = {
        slug: 'new-slug',
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      await resolver.productUpdate(productId, updateDto, 'admin-token');
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
    it('should update product with only description', async () => {
      const updateDto: UpdateProductDto = {
        description: 'New description',
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      await resolver.productUpdate(productId, updateDto, 'admin-token');
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
    it('should update product with only price', async () => {
      const updateDto: UpdateProductDto = {
        price: 50000,
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      await resolver.productUpdate(productId, updateDto, 'admin-token');
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
    it('should update product with only stockCount', async () => {
      const updateDto: UpdateProductDto = {
        stockCount: 100,
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      await resolver.productUpdate(productId, updateDto, 'admin-token');
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
    it('should update product with only category', async () => {
      const updateDto: UpdateProductDto = {
        category: 'books',
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      await resolver.productUpdate(productId, updateDto, 'admin-token');
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
    it('should update product with only tags', async () => {
      const updateDto: UpdateProductDto = {
        tags: ['new_tag', 'another_tag'],
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      await resolver.productUpdate(productId, updateDto, 'admin-token');
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
    it('should update product with multiple fields', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Name',
        price: 60000,
        stockCount: 75,
        tags: ['updated_tag'],
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.update.mockResolvedValue(updatedProduct);
      const result = await resolver.productUpdate(
        productId,
        updateDto,
        'admin-token',
      );
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
      expect(result).toEqual(updatedProduct);
    });
  });
  describe('productDelete', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    it('should throw UnauthorizedException when not authenticated', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(
        resolver.productDelete(productId, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'invalid-token',
      );
      expect(mockProductsService.delete).not.toHaveBeenCalled();
    });
    it('should throw ForbiddenException when authenticated as non-admin', async () => {
      const customerAuth = {
        id: 2,
        username: 'customer',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(customerAuth);
      await expect(
        resolver.productDelete(productId, 'customer-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'customer-token',
      );
      expect(mockProductsService.delete).not.toHaveBeenCalled();
    });
    it('should throw ForbiddenException when authenticated as anonymous', async () => {
      const anonymousAuth = {
        id: 3,
        username: 'anonymous',
        role: $Enums.Role.ANONYMOUS,
      };
      mockAuthService.processAuthParam.mockResolvedValue(anonymousAuth);
      await expect(
        resolver.productDelete(productId, 'anon-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'anon-token',
      );
      expect(mockProductsService.delete).not.toHaveBeenCalled();
    });
    it('should delete product when authenticated as admin', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.delete.mockResolvedValue(undefined);
      const result = await resolver.productDelete(productId, 'admin-token');
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockProductsService.delete).toHaveBeenCalledWith(productId);
      expect(result).toBe(true);
    });
    it('should return true after successful deletion', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockProductsService.delete.mockResolvedValue(undefined);
      const result = await resolver.productDelete(
        'another-product-id',
        'admin-token',
      );
      expect(result).toBe(true);
      expect(mockProductsService.delete).toHaveBeenCalledWith(
        'another-product-id',
      );
    });
  });
});
