import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '@contracts/catalog/providers/products.service';
import { AuthService } from '@contracts/auth/providers/auth.service';
import {
  CreateProductDto,
  SearchProductDto,
  UpdateProductDto,
} from '@contracts/catalog/providers/products.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('ProductsController - Security & Data Validation', () => {
  let controller: ProductsController;

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

  const mockAdminAuth = {
    id: 1,
    username: 'admin',
    role: $Enums.Role.ADMIN,
  };

  const mockCustomerAuth = {
    id: 2,
    username: 'customer',
    role: $Enums.Role.CUSTOMER,
  };

  const mockProductResponse = {
    id: 'prod_1',
    name: 'test product',
    slug: 'test-product',
    description: 'a product',
    price: 1000,
    stockCount: 5,
    category: 'dev',
    tags: ['tag_one'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const validCreateDto: CreateProductDto = {
    name: 'test product',
    slug: 'test-product',
    description: 'a product',
    price: 1000,
    stockCount: 5,
    category: 'dev',
    tags: ['tag_one'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
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

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Validation - CreateProductDto', () => {
    it('should reject name with special characters', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validCreateDto,
        name: 'bad@name',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject invalid slug format', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validCreateDto,
        slug: 'Bad-Slug',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('slug');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject negative price', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validCreateDto,
        price: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should reject invalid tag format', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validCreateDto,
        tags: ['Invalid_Tag'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tags');
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('Security - Create Product Authorization', () => {
    it('should reject unauthenticated creation', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);

      await expect(controller.create(validCreateDto, 'token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith('token');
    });

    it('should reject non-admin creation', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

      await expect(controller.create(validCreateDto, 'token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin creation', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockProductsService.create.mockResolvedValue(mockProductResponse);

      const result = await controller.create(validCreateDto, 'token');

      expect(result).toEqual(mockProductResponse);
      expect(mockProductsService.create).toHaveBeenCalledWith(validCreateDto);
    });
  });

  describe('Search & Read', () => {
    it('should search products without auth', async () => {
      const query: SearchProductDto = { q: 'test' };
      mockProductsService.search.mockResolvedValue([mockProductResponse]);

      const result = await controller.search(query);

      expect(result).toEqual([mockProductResponse]);
      expect(mockProductsService.search).toHaveBeenCalledWith(query);
    });

    it('should read a product by id', async () => {
      mockProductsService.read.mockResolvedValue(mockProductResponse);

      const result = await controller.read('prod_1');

      expect(result).toEqual(mockProductResponse);
      expect(mockProductsService.read).toHaveBeenCalledWith('prod_1');
    });
  });

  describe('Security - Update Product Authorization', () => {
    it('should reject missing body', async () => {
      await expect(
        controller.update(
          'prod_1',
          undefined as unknown as UpdateProductDto,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject empty body', async () => {
      await expect(controller.update('prod_1', {}, 'token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject unauthenticated update', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);

      await expect(
        controller.update('prod_1', { name: 'new' }, 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject non-admin update', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

      await expect(
        controller.update('prod_1', { name: 'new' }, 'token'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin update', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockProductsService.update.mockResolvedValue(mockProductResponse);

      const result = await controller.update(
        'prod_1',
        { name: 'new' },
        'token',
      );

      expect(result).toEqual(mockProductResponse);
      expect(mockProductsService.update).toHaveBeenCalledWith('prod_1', {
        name: 'new',
      });
    });
  });

  describe('Security - Delete Product Authorization', () => {
    it('should reject unauthenticated delete', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);

      await expect(controller.delete('prod_1', 'token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject non-admin delete', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

      await expect(controller.delete('prod_1', 'token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin delete', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockProductsService.delete.mockResolvedValue(undefined);

      await expect(
        controller.delete('prod_1', 'token'),
      ).resolves.toBeUndefined();
      expect(mockProductsService.delete).toHaveBeenCalledWith('prod_1');
    });
  });
});
