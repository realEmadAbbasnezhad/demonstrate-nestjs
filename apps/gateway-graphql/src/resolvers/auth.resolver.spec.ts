import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { LoginDto, LoginResponseDto } from '@contracts/auth/providers/auth.dto';
import { $Enums } from '@prisma/generated/auth';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('authLogin', () => {
    it('should successfully login and return LoginResponseDto', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const expectedResponse: LoginResponseDto = {
        id: 1,
        username: 'testuser',
        role: $Enums.Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        token: 'mock-jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await resolver.authLogin(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error when login fails', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(resolver.authLogin(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
