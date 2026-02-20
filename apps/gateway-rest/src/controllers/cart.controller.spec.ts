import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from '@contracts/order/providers/cart.service';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { $Enums } from '@prisma/generated/auth';
import {
  UpdateCartDto,
  ReadCartResponseDto,
} from '@contracts/order/providers/cart.dto';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
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

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('update', () => {
    it('should update the cart if authorized', async () => {
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
        await controller.update(1, updateCartDto, authParam.id.toString()),
      ).toBe(response);
    });

    it('should throw UnauthorizedException if not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(
        controller.update(1, {} as UpdateCartDto, 'authParam'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        role: $Enums.Role.ANONYMOUS,
        id: 1,
        username: 'anonymousUser',
      });

      await expect(
        controller.update(1, {} as UpdateCartDto, 'authParam'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('read', () => {
    it('should return the cart if authorized', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };
      const response: ReadCartResponseDto[] = [];

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(cartService, 'read').mockResolvedValue(response);

      expect(await controller.read(1, authParam.id.toString())).toBe(response);
    });

    it('should throw UnauthorizedException if not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(controller.read(1, 'authParam')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        role: $Enums.Role.ANONYMOUS,
        id: 1,
        username: 'anonymousUser',
      });

      await expect(controller.read(1, 'authParam')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should delete the cart if authorized', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(cartService, 'delete').mockResolvedValue(null);

      expect(await controller.delete(1, authParam.id.toString())).toBe(null);
    });

    it('should throw UnauthorizedException if not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(controller.delete(1, 'authParam')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        role: $Enums.Role.ANONYMOUS,
        id: 1,
        username: 'anonymousUser',
      });

      await expect(controller.delete(1, 'authParam')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
