import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HashService } from '@common/hash/hash.service';
import { $Enums, User } from '@prisma/generated/auth';

describe('AuthService - Business Logic', () => {
  let service: AuthService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processAuthParam - Token Parsing & Validation', () => {
    describe('token parsing', () => {
      it('should extract Bearer token from auth header', async () => {
        const mockPayload = {
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
        };
        mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

        const result = await service.processAuthParam('Bearer validtoken123');

        expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
          'validtoken123',
          {},
        );
        expect(result).toEqual(mockPayload);
      });

      it('should return null for non-Bearer token type', async () => {
        const result = await service.processAuthParam('Basic token123');

        expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });

      it('should handle header with only Bearer prefix', async () => {
        mockJwtService.verifyAsync.mockRejectedValue(
          new Error('Invalid token'),
        );

        const result = await service.processAuthParam('Bearer');

        expect(result).toBeNull();
      });

      it('should handle empty header', async () => {
        const result = await service.processAuthParam('');

        expect(result).toBeNull();
      });

      it('should handle header with extra spaces', async () => {
        const mockPayload = {
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
        };
        mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

        const result = await service.processAuthParam('Bearer token123 extra');

        expect(result).toEqual(mockPayload);
      });
    });

    describe('token verification', () => {
      it('should return null when token verification fails', async () => {
        mockJwtService.verifyAsync.mockRejectedValue(
          new Error('Invalid token'),
        );

        const result = await service.processAuthParam('Bearer invalidtoken');

        expect(result).toBeNull();
      });

      it('should return null when token is expired', async () => {
        mockJwtService.verifyAsync.mockRejectedValue(
          new Error('TokenExpiredError'),
        );

        const result = await service.processAuthParam('Bearer expiredtoken');

        expect(result).toBeNull();
      });

      it('should return null when token is malformed', async () => {
        mockJwtService.verifyAsync.mockRejectedValue(
          new Error('JsonWebTokenError'),
        );

        const result = await service.processAuthParam('Bearer malformed');

        expect(result).toBeNull();
      });
    });

    describe('payload extraction', () => {
      it('should return complete JWT payload', async () => {
        const mockPayload = {
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
        };
        mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

        const result = await service.processAuthParam('Bearer token');

        expect(result).toEqual(mockPayload);
        expect(result?.id).toBe(1);
        expect(result?.username).toBe('admin');
        expect(result?.role).toBe($Enums.Role.ADMIN);
      });

      it('should return payload with CUSTOMER role', async () => {
        const mockPayload = {
          id: 2,
          username: 'customer',
          role: $Enums.Role.CUSTOMER,
        };
        mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

        const result = await service.processAuthParam('Bearer token');

        expect(result?.role).toBe($Enums.Role.CUSTOMER);
      });

      it('should return payload with ANONYMOUS role', async () => {
        const mockPayload = {
          id: 3,
          username: 'guest',
          role: $Enums.Role.ANONYMOUS,
        };
        mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

        const result = await service.processAuthParam('Bearer token');

        expect(result?.role).toBe($Enums.Role.ANONYMOUS);
      });

      it('should preserve user id from token', async () => {
        const mockPayload = {
          id: 999,
          username: 'testuser',
          role: $Enums.Role.CUSTOMER,
        };
        mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

        const result = await service.processAuthParam('Bearer token');

        expect(result?.id).toBe(999);
      });
    });
  });

  describe('login - Authentication & Token Generation', () => {
    const loginDto = {
      username: 'admin',
      password: 'password123',
    };

    const mockAdminUser: User = {
      id: 1,
      username: 'admin',
      password_hash: 'hashedPassword123',
      role: $Enums.Role.ADMIN,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    };

    describe('user lookup', () => {
      it('should lookup user by username', async () => {
        const readUserSpy = jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        expect(readUserSpy).toHaveBeenCalledWith('admin');
        expect(readUserSpy).toHaveBeenCalledTimes(1);
      });

      it('should throw NotFoundException if user does not exist', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'Username is not found',
        );
      });

      it('should handle case-sensitive username lookup', async () => {
        const upperCaseLoginDto = {
          username: 'ADMIN',
          password: 'password123',
        };
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(null);

        await expect(service.login(upperCaseLoginDto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('password verification', () => {
      it('should verify password against stored hash', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        expect(mockHashService.verify).toHaveBeenCalledWith(
          'password123',
          'hashedPassword123',
        );
        expect(mockHashService.verify).toHaveBeenCalledTimes(1);
      });

      it('should throw UnauthorizedException for wrong password', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(false);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'Password is wrong',
        );
      });

      it('should not call password verification if user not found', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow();

        expect(mockHashService.verify).not.toHaveBeenCalled();
      });

      it('should handle password verification errors', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockRejectedValue(
          new Error('Hash comparison error'),
        );

        await expect(service.login(loginDto)).rejects.toThrow();
      });
    });

    describe('JWT token generation', () => {
      it('should generate JWT token with user payload', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('jwt.token.admin');

        await service.login(loginDto);

        expect(mockJwtService.signAsync).toHaveBeenCalled();
        expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
      });

      it('should include user id in JWT payload', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const mockCalls = (mockJwtService.signAsync as jest.Mock).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(mockCalls[0][0].id).toBe(1);
      });

      it('should include username in JWT payload', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const mockCalls = (mockJwtService.signAsync as jest.Mock).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(mockCalls[0][0].username).toBe('admin');
      });

      it('should include user role in JWT payload', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const mockCalls = (mockJwtService.signAsync as jest.Mock).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(mockCalls[0][0].role).toBe($Enums.Role.ADMIN);
      });

      it('should only include id, username, and role in JWT payload', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const mockCalls = (mockJwtService.signAsync as jest.Mock).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        expect(Object.keys(mockCalls[0][0])).toEqual([
          'id',
          'username',
          'role',
        ]);
      });

      it('should not include password_hash in JWT payload', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const mockCalls = (mockJwtService.signAsync as jest.Mock).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(mockCalls[0][0]).not.toHaveProperty('password_hash');
      });
    });

    describe('response construction', () => {
      it('should return token in response', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('jwt.token.here');

        const result = await service.login(loginDto);

        expect(result.token).toBe('jwt.token.here');
      });

      it('should return user id in response', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result.id).toBe(1);
      });

      it('should return username in response', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result.username).toBe('admin');
      });

      it('should return user role in response', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result.role).toBe($Enums.Role.ADMIN);
      });

      it('should return timestamps in response', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result.createdAt).toEqual(mockAdminUser.createdAt);
        expect(result.updatedAt).toEqual(mockAdminUser.updatedAt);
      });

      it('should return deletedAt as null for active user', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result.deletedAt).toBeNull();
      });

      it('should not return password_hash in response', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result).not.toHaveProperty('password_hash');
      });

      it('should return complete response object', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result).toEqual({
          token: 'token',
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
          createdAt: mockAdminUser.createdAt,
          updatedAt: mockAdminUser.updatedAt,
          deletedAt: null,
        });
      });
    });

    describe('different user roles', () => {
      it('should login successfully with ADMIN role', async () => {
        const adminUser = { ...mockAdminUser, role: $Enums.Role.ADMIN };
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(adminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('admin.token');

        const result = await service.login(loginDto);

        expect(result.role).toBe($Enums.Role.ADMIN);
      });

      it('should login successfully with CUSTOMER role', async () => {
        const customerUser = {
          ...mockAdminUser,
          id: 2,
          username: 'customer',
          role: $Enums.Role.CUSTOMER,
        };
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(customerUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('customer.token');

        const result = await service.login({
          username: 'customer',
          password: 'password123',
        });

        expect(result.role).toBe($Enums.Role.CUSTOMER);
      });

      it('should login successfully with ANONYMOUS role', async () => {
        const anonUser = {
          ...mockAdminUser,
          id: 3,
          username: 'guest',
          role: $Enums.Role.ANONYMOUS,
        };
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(anonUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('anon.token');

        const result = await service.login({
          username: 'guest',
          password: 'password123',
        });

        expect(result.role).toBe($Enums.Role.ANONYMOUS);
      });
    });

    describe('multiple login attempts', () => {
      it('should generate different tokens for consecutive logins', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync
          .mockResolvedValueOnce('token1')
          .mockResolvedValueOnce('token2');

        const result1 = await service.login(loginDto);
        const result2 = await service.login(loginDto);

        expect(result1.token).toBe('token1');
        expect(result2.token).toBe('token2');
        expect(result1.token).not.toBe(result2.token);
      });

      it('should verify password for each login attempt', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login(loginDto);
        await service.login(loginDto);

        expect(mockHashService.verify).toHaveBeenCalledTimes(2);
      });
    });

    describe('edge cases', () => {
      it('should handle user with very long username', async () => {
        const longUsername = 'a'.repeat(255);
        const userWithLongName = {
          ...mockAdminUser,
          username: longUsername,
        };
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(userWithLongName);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login({
          username: longUsername,
          password: 'password123',
        });

        expect(result.username).toBe(longUsername);
      });

      it('should handle user with special characters in password', async () => {
        const specialPassword = 'p@$$w0rd!#%&*()[]{}';
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.login({
          username: 'admin',
          password: specialPassword,
        });

        expect(mockHashService.verify).toHaveBeenCalledWith(
          specialPassword,
          mockAdminUser.password_hash,
        );
      });

      it('should handle user with timestamps far in the past', async () => {
        const oldUser = {
          ...mockAdminUser,
          createdAt: new Date('2000-01-01'),
          updatedAt: new Date('2000-01-01'),
        };
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(oldUser);
        mockHashService.verify.mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.login(loginDto);

        expect(result.createdAt).toEqual(oldUser.createdAt);
      });

      it('should handle soft-deleted user as not found', async () => {
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Integration - Complete Auth Flow', () => {
    const loginDto = {
      username: 'admin',
      password: 'password123',
    };

    const mockAdminUser: User = {
      id: 1,
      username: 'admin',
      password_hash: 'hashedPassword123',
      role: $Enums.Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should complete full login flow successfully', async () => {
      jest
        .spyOn(service as any, '_readUserByUsername')
        .mockResolvedValue(mockAdminUser);
      mockHashService.verify.mockResolvedValue(true);
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token.signature';
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      const loginResult = await service.login(loginDto);

      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      });

      const authResult = await service.processAuthParam(`Bearer ${jwtToken}`);

      expect(loginResult.token).toBe(jwtToken);
      expect(authResult?.id).toBe(1);
      expect(authResult?.username).toBe('admin');
    });

    it('should fail login then fail auth verification', async () => {
      jest.spyOn(service as any, '_readUserByUsername').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const authResult = await service.processAuthParam('Bearer invalidtoken');
      expect(authResult).toBeNull();
    });

    it('should logout by using expired token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('TokenExpiredError'),
      );

      const authResult = await service.processAuthParam('Bearer expiredtoken');

      expect(authResult).toBeNull();
    });
  });
});
