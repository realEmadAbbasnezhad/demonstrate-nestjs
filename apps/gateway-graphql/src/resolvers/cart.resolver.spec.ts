import { Test, TestingModule } from '@nestjs/testing';
import { CartResolver } from './cart.resolver';
import { CartService } from '@contracts/order/providers/cart.service';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { $Enums } from '@prisma/generated/auth';
import {
  UpdateCartDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';

describe('CartResolver', () => {
  let resolver: CartResolver;
  let cartService: CartService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartResolver,
        {
          provide: CartService,
          useValue: {
            update: jest.fn(),
            read: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            processAuthParam: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<CartResolver>(CartResolver);
    cartService = module.get<CartService>(CartService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('update', () => {
    it('updates the cart successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };
      const updateCartDto: UpdateCartDto = { productId: '1', quantity: 2 };
      const response: ReadCartResponseDto[] = [];

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(cartService, 'update').mockResolvedValue(response);

      expect(
        await resolver.update(1, updateCartDto, authParam.id.toString()),
      ).toBe(response);
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(resolver.update(1, {} as UpdateCartDto, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(resolver.update(1, {} as UpdateCartDto, '')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('read', () => {
    it('retrieves the cart successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };
      const response: ReadCartResponseDto[] = [];

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(cartService, 'read').mockResolvedValue(response);

      expect(await resolver.read(1, authParam.id.toString())).toBe(response);
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(resolver.read(1, '')).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(resolver.read(1, '')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('deletes the cart successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(cartService, 'delete').mockResolvedValue(null);

      expect(await resolver.delete(1, authParam.id.toString())).toBe(true);
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(resolver.delete(1, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(resolver.delete(1, '')).rejects.toThrow(ForbiddenException);
    });
  });
});
