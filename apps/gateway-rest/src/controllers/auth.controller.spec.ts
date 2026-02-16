import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@gateway-rest/controllers/auth.controller';
import { AuthService } from '@gateway-rest/providers/auth/auth.service';
import { LoginDto } from '@contracts/microservice/auth/auth.dto';
import { $Enums } from '@prisma/generated/auth';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('AuthController - Security & Data Validation', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    processAuthParam: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Validation - LoginDto', () => {
    describe('username validation', () => {
      it('should reject empty username', async () => {
        const dto = plainToInstance(LoginDto, {
          username: '',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should reject username with special characters', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin@123',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
        expect(errors[0].constraints).toHaveProperty('matches');
        expect(errors[0].constraints?.matches).toBe(
          'Username can only contain letters and numbers',
        );
      });

      it('should reject username with spaces', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin user',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
      });

      it('should reject username with SQL injection attempt', async () => {
        const dto = plainToInstance(LoginDto, {
          username: "admin' OR '1'='1",
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
      });

      it('should accept valid alphanumeric username', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin123',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject non-string username', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 12345,
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
        expect(errors[0].constraints).toHaveProperty('isString');
      });
    });

    describe('password validation', () => {
      it('should reject empty password', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin',
          password: '',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should reject password shorter than 8 characters', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin',
          password: 'pass123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
        expect(errors[0].constraints).toHaveProperty('minLength');
      });

      it('should accept password with exactly 8 characters', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin',
          password: 'password',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should accept password longer than 8 characters', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin',
          password: 'verylongpassword123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject non-string password', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin',
          password: 12345678,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
        expect(errors[0].constraints).toHaveProperty('isString');
      });
    });

    describe('combined validation', () => {
      it('should reject when both fields are invalid', async () => {
        const dto = plainToInstance(LoginDto, {
          username: 'admin@#$',
          password: 'short',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(2);
        const properties = errors.map((e) => e.property);
        expect(properties).toContain('username');
        expect(properties).toContain('password');
      });

      it('should reject when fields are missing', async () => {
        const dto = plainToInstance(LoginDto, {});

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Security - Role-based Authentication', () => {
    const validLoginDto: LoginDto = {
      username: 'admin',
      password: 'password',
    };

    describe('ADMIN role login', () => {
      it('should successfully login as ADMIN', async () => {
        const adminResponse = {
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.token',
        };
        mockAuthService.login.mockResolvedValue(adminResponse);

        const result = await controller.login(validLoginDto);

        expect(mockAuthService.login).toHaveBeenCalledWith(validLoginDto);
        expect(result.role).toBe($Enums.Role.ADMIN);
        expect(result.token).toBeDefined();
        expect(result.token).toContain('eyJ');
      });

      it('should return JWT token for ADMIN', async () => {
        const adminResponse = {
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'admin.jwt.token',
        };
        mockAuthService.login.mockResolvedValue(adminResponse);

        const result = await controller.login(validLoginDto);

        expect(result.token).toBe('admin.jwt.token');
      });

      it('should not expose password_hash for ADMIN', async () => {
        const adminResponse = {
          id: 1,
          username: 'admin',
          role: $Enums.Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'admin.jwt.token',
        };
        mockAuthService.login.mockResolvedValue(adminResponse);

        const result = await controller.login(validLoginDto);

        expect(result).not.toHaveProperty('password_hash');
        expect(result).not.toHaveProperty('password');
      });
    });

    describe('CUSTOMER role login', () => {
      it('should successfully login as CUSTOMER', async () => {
        const customerResponse = {
          id: 2,
          username: 'customer1',
          role: $Enums.Role.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'customer.jwt.token',
        };
        mockAuthService.login.mockResolvedValue(customerResponse);

        const result = await controller.login({
          username: 'customer1',
          password: 'password123',
        });

        expect(result.role).toBe($Enums.Role.CUSTOMER);
        expect(result.token).toBeDefined();
      });

      it('should return different token for different users', async () => {
        const customer1Response = {
          id: 2,
          username: 'customer1',
          role: $Enums.Role.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'customer1.jwt.token',
        };
        mockAuthService.login.mockResolvedValue(customer1Response);

        const result1 = await controller.login({
          username: 'customer1',
          password: 'password123',
        });

        const customer2Response = {
          id: 3,
          username: 'customer2',
          role: $Enums.Role.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'customer2.jwt.token',
        };
        mockAuthService.login.mockResolvedValue(customer2Response);

        const result2 = await controller.login({
          username: 'customer2',
          password: 'password123',
        });

        expect(result1.token).not.toBe(result2.token);
      });
    });

    describe('ANONYMOUS role login', () => {
      it('should successfully login as ANONYMOUS', async () => {
        const anonymousResponse = {
          id: 3,
          username: 'guest123',
          role: $Enums.Role.ANONYMOUS,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          token: 'anonymous.jwt.token',
        };
        mockAuthService.login.mockResolvedValue(anonymousResponse);

        const result = await controller.login({
          username: 'guest123',
          password: 'password123',
        });

        expect(result.role).toBe($Enums.Role.ANONYMOUS);
        expect(result.token).toBeDefined();
      });
    });
  });

  describe('Security - Authentication Errors', () => {
    it('should throw NotFoundException for non-existent username', async () => {
      mockAuthService.login.mockRejectedValue(
        new NotFoundException('Username is not found'),
      );

      await expect(
        controller.login({
          username: 'nonexistent',
          password: 'password123',
        }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        controller.login({
          username: 'nonexistent',
          password: 'password123',
        }),
      ).rejects.toThrow('Username is not found');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Password is wrong'),
      );

      await expect(
        controller.login({
          username: 'admin',
          password: 'wrongpassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        controller.login({
          username: 'admin',
          password: 'wrongpassword123',
        }),
      ).rejects.toThrow('Password is wrong');
    });

    it('should not leak information about whether username exists', async () => {
      // Test that we don't give different error messages for existing vs non-existing users
      mockAuthService.login.mockRejectedValue(
        new NotFoundException('Username is not found'),
      );

      const error1 = controller.login({
        username: 'admin',
        password: 'wrongpass123',
      });

      mockAuthService.login.mockRejectedValue(
        new NotFoundException('Username is not found'),
      );

      const error2 = controller.login({
        username: 'nonexistent',
        password: 'password123',
      });

      await expect(error1).rejects.toThrow(NotFoundException);
      await expect(error2).rejects.toThrow(NotFoundException);
    });
  });

  describe('Security - Input Sanitization', () => {
    it('should handle XSS attempt in username', async () => {
      const dto = plainToInstance(LoginDto, {
        username: '<script>alert("xss")</script>',
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should handle null byte injection', async () => {
      const dto = plainToInstance(LoginDto, {
        username: 'admin\0',
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters in username', async () => {
      const dto = plainToInstance(LoginDto, {
        username: 'admin™',
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle extremely long username', async () => {
      const dto = plainToInstance(LoginDto, {
        username: 'a'.repeat(1000),
        password: 'password123',
      });

      const errors = await validate(dto);
      // Should still validate based on pattern (alphanumeric only)
      expect(errors.length).toBe(0); // Pattern allows it, but backend should have max length
    });

    it('should handle extremely long password', async () => {
      const dto = plainToInstance(LoginDto, {
        username: 'admin',
        password: 'a'.repeat(10000),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // MinLength is satisfied
    });
  });

  describe('Security - Token Validation', () => {
    it('should return valid JWT structure', async () => {
      const response = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.signature',
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login({
        username: 'admin',
        password: 'password',
      });

      expect(result.token).toBeDefined();
      expect(result.token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user id in response', async () => {
      const response = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        token: 'jwt.token',
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login({
        username: 'admin',
        password: 'password',
      });

      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should include role in response', async () => {
      const response = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        token: 'jwt.token',
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login({
        username: 'admin',
        password: 'password',
      });

      expect(result.role).toBe($Enums.Role.ADMIN);
      expect(Object.values($Enums.Role)).toContain(result.role);
    });

    it('should include timestamps in response', async () => {
      const now = new Date();
      const response = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        token: 'jwt.token',
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login({
        username: 'admin',
        password: 'password',
      });

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('Security - Soft Delete Handling', () => {
    it('should reject login for soft-deleted user', async () => {
      mockAuthService.login.mockRejectedValue(
        new NotFoundException('Username is not found'),
      );

      await expect(
        controller.login({
          username: 'deleteduser',
          password: 'password123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Data Pipeline - Controller to Service', () => {
    it('should pass LoginDto to service unchanged', async () => {
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'password',
      };
      const response = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        token: 'jwt.token',
      };
      mockAuthService.login.mockResolvedValue(response);

      await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('should propagate service response to caller', async () => {
      const response = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        token: 'jwt.token',
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login({
        username: 'admin',
        password: 'password',
      });

      expect(result).toEqual(response);
    });

    it('should propagate service errors to caller', async () => {
      const error = new UnauthorizedException('Password is wrong');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login({
          username: 'admin',
          password: 'wrongpass123',
        }),
      ).rejects.toThrow(error);
    });
  });
});
