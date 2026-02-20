import { Test, TestingModule } from '@nestjs/testing';
import { OrderResolver } from './order.resolver';
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

describe('OrderResolver', () => {
  let resolver: OrderResolver;
  let orderService: OrderService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderResolver,
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

    resolver = module.get<OrderResolver>(OrderResolver);
    orderService = module.get<OrderService>(OrderService);
    authService = module.get<AuthService>(AuthService);
  });

  it('creates an order successfully for authorized user', async () => {
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
      await resolver.create(1, createOrderDto, authParam.id.toString()),
    ).toBe(response);
  });

  it('throws UnauthorizedException if user is not logged in', async () => {
    jest.spyOn(authService, 'processAuthParam').mockResolvedValue(null);

    await expect(resolver.create(1, {} as CreateOrderDto, '')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws ForbiddenException for anonymous users', async () => {
    jest.spyOn(authService, 'processAuthParam').mockResolvedValue({
      id: 1,
      role: $Enums.Role.ANONYMOUS,
      username: 'anonymousUser',
    });

    await expect(resolver.create(1, {} as CreateOrderDto, '')).rejects.toThrow(
      ForbiddenException,
    );
  });

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
      await resolver.createShipping(
        1,
        createShippingDto,
        authParam.id.toString(),
      ),
    ).toBe(response);
  });

  it('retrieves order status successfully for authorized user', async () => {
    const authParam = {
      id: 1,
      role: $Enums.Role.CUSTOMER,
      username: 'testUser',
    };
    const response: ReadOrderResponseDto = { status: 'Pending' };

    jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
    jest.spyOn(orderService, 'read').mockResolvedValue(response);

    expect(await resolver.read(false, 1, authParam.id.toString())).toBe(
      response,
    );
  });

  it('cancels an order successfully for authorized user', async () => {
    const authParam = {
      id: 1,
      role: $Enums.Role.CUSTOMER,
      username: 'testUser',
    };

    jest.spyOn(authService, 'processAuthParam').mockResolvedValue(authParam);
    jest.spyOn(orderService, 'delete').mockResolvedValue(null);

    expect(await resolver.delete(1, authParam.id.toString())).toBe(true);
  });
});
