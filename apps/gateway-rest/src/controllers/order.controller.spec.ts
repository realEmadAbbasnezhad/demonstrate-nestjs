import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '@contracts/order/providers/order.service';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { $Enums } from '@prisma/generated/auth';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
  CreateShippingDto,
  CreateShippingResponseDto,
  ReadOrderResponseDto,
} from '@contracts/order/providers/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
            createShipping: jest.fn(),
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

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('create', () => {
    it('reserves a cart successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };
      const createOrderDto: CreateOrderDto = { productId: '1', quantity: 2 };
      const response: CreateOrderResponseDto = { orderId: 1 };

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(orderService, 'create').mockResolvedValue(response);

      expect(
        await controller.create(1, createOrderDto, authParam.id.toString()),
      ).toBe(response);
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(
        controller.create(1, {} as CreateOrderDto, ''),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(
        controller.create(1, {} as CreateOrderDto, ''),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createShipping', () => {
    it('sets shipping info successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };
      const createShippingDto: CreateShippingDto = { address: '123 Street' };
      const response: CreateShippingResponseDto = { shippingId: 1 };

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(orderService, 'createShipping').mockResolvedValue(response);

      expect(
        await controller.createShipping(
          1,
          createShippingDto,
          authParam.id.toString(),
        ),
      ).toBe(response);
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(
        controller.createShipping(1, {} as CreateShippingDto, ''),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(
        controller.createShipping(1, {} as CreateShippingDto, ''),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('read', () => {
    it('retrieves order status successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };
      const response: ReadOrderResponseDto = { status: 'Pending' };

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(orderService, 'read').mockResolvedValue(response);

      expect(await controller.read(false, 1, authParam.id.toString())).toBe(
        response,
      );
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(controller.read(false, 1, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(controller.read(false, 1, '')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('cancels an order successfully for authorized user', async () => {
      const authParam = {
        id: 1,
        role: $Enums.Role.CUSTOMER,
        username: 'testUser',
      };

      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
      jest.spyOn(orderService, 'delete').mockResolvedValue(null);

      expect(await controller.delete(1, authParam.id.toString())).toBe(null);
    });

    it('throws UnauthorizedException if user is not logged in', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

      await expect(controller.delete(1, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException for anonymous users', async () => {
      jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
        id: 1,
        role: $Enums.Role.ANONYMOUS,
        username: 'anonymousUser',
      });

      await expect(controller.delete(1, '')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
