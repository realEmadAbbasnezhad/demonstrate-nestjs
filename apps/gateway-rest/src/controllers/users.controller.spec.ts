import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '@gateway-rest/providers/users.service';
import { AuthService } from '@gateway-rest/providers/auth/auth.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ReadUserDto,
} from '@contracts/microservice/auth/users.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('UsersController - Security & Data Validation', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
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

  const mockAnonymousAuth = {
    id: 3,
    username: 'guest',
    role: $Enums.Role.ANONYMOUS,
  };

  const mockUserResponse = {
    id: 2,
    username: 'customer',
    role: $Enums.Role.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Validation - CreateUserDto', () => {
    describe('username validation', () => {
      it('should reject empty username', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: '',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should reject username with special characters', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user@123',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
        expect(errors[0].constraints).toHaveProperty('matches');
      });

      it('should accept valid alphanumeric username', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user123',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    describe('password validation', () => {
      it('should reject password shorter than 8 characters', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user123',
          password: 'pass123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
        expect(errors[0].constraints).toHaveProperty('minLength');
      });

      it('should accept password with 8+ characters', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user123',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    describe('role validation', () => {
      it('should accept valid role', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user123',
          password: 'password123',
          role: $Enums.Role.CUSTOMER,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject invalid role', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user123',
          password: 'password123',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          role: 'INVALID_ROLE' as any,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('role');
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept missing role (optional)', async () => {
        const dto = plainToInstance(CreateUserDto, {
          username: 'user123',
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });
  });

  describe('Data Validation - UpdateUserDto', () => {
    describe('username validation', () => {
      it('should reject username with special characters', async () => {
        const dto = plainToInstance(UpdateUserDto, {
          username: 'user@123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('username');
        expect(errors[0].constraints).toHaveProperty('matches');
      });

      it('should accept valid alphanumeric username', async () => {
        const dto = plainToInstance(UpdateUserDto, {
          username: 'newuser123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    describe('password validation', () => {
      it('should reject password shorter than 8 characters', async () => {
        const dto = plainToInstance(UpdateUserDto, {
          password: 'short',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
        expect(errors[0].constraints).toHaveProperty('minLength');
      });

      it('should accept password with 8+ characters', async () => {
        const dto = plainToInstance(UpdateUserDto, {
          password: 'newpassword123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    it('should accept all fields as optional', async () => {
      const dto = plainToInstance(UpdateUserDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Security - Create User Authorization', () => {
    const createDto: CreateUserDto = {
      username: 'newuser',
      password: 'password123',
    };

    describe('without role field', () => {
      it('should allow anonymous user creation without auth', async () => {
        const response = {
          ...mockUserResponse,
          token: 'new.jwt.token',
        };
        mockUsersService.create.mockResolvedValue(response);

        const result = await controller.create(createDto, '');

        expect(result).toEqual(response);
        expect(mockAuthService.processAuthParam).not.toHaveBeenCalled();
      });

      it('should not require authentication if no role specified', async () => {
        const response = {
          ...mockUserResponse,
          token: 'new.jwt.token',
        };
        mockUsersService.create.mockResolvedValue(response);

        await controller.create(createDto, '');

        expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
      });
    });

    describe('with role field', () => {
      it('should throw UnauthorizedException if not logged in when setting role', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(null);

        await expect(
          controller.create(
            { ...createDto, role: $Enums.Role.CUSTOMER },
            'Bearer invalid',
          ),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          controller.create(
            { ...createDto, role: $Enums.Role.CUSTOMER },
            'Bearer invalid',
          ),
        ).rejects.toThrow('you must be logged in to set user role');
      });

      it('should throw ForbiddenException if non-admin tries to set role', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.create(
            { ...createDto, role: $Enums.Role.CUSTOMER },
            'Bearer customer.token',
          ),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.create(
            { ...createDto, role: $Enums.Role.CUSTOMER },
            'Bearer customer.token',
          ),
        ).rejects.toThrow('Only admins can set the role of a new user');
      });

      it('should allow ADMIN to create user with role', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
        const response = {
          ...mockUserResponse,
          role: $Enums.Role.ADMIN,
          token: 'new.admin.token',
        };
        mockUsersService.create.mockResolvedValue(response);

        const result = await controller.create(
          { ...createDto, role: $Enums.Role.ADMIN },
          'Bearer admin.token',
        );

        expect(result).toEqual(response);
        expect(mockUsersService.create).toHaveBeenCalledWith({
          ...createDto,
          role: $Enums.Role.ADMIN,
        });
      });

      it('should block ANONYMOUS from setting role', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockAnonymousAuth);

        await expect(
          controller.create(
            { ...createDto, role: $Enums.Role.CUSTOMER },
            'Bearer anonymous.token',
          ),
        ).rejects.toThrow(ForbiddenException);
      });

      it('should block CUSTOMER from creating ADMIN', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.create(
            { ...createDto, role: $Enums.Role.ADMIN },
            'Bearer customer.token',
          ),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Security - Read User Authorization', () => {
    it('should throw UnauthorizedException if not logged in', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);

      await expect(
        controller.read({ id: 2 }, 'Bearer invalid'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        controller.read({ id: 2 }, 'Bearer invalid'),
      ).rejects.toThrow('you must be logged in to see users');
    });

    describe('reading all users', () => {
      it('should allow ADMIN to read all users', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
        mockUsersService.read.mockResolvedValue(mockUserResponse);

        const result = await controller.read({}, 'Bearer admin.token');

        expect(result).toEqual(mockUserResponse);
        expect(mockUsersService.read).toHaveBeenCalledWith(
          undefined,
          undefined,
        );
      });

      it('should throw ForbiddenException if non-admin tries to read all users', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.read({}, 'Bearer customer.token'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.read({}, 'Bearer customer.token'),
        ).rejects.toThrow('only admins can see all users');
      });
    });

    describe('reading by id', () => {
      it('should allow ADMIN to read any user by id', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
        mockUsersService.read.mockResolvedValue(mockUserResponse);

        const result = await controller.read({ id: 5 }, 'Bearer admin.token');

        expect(result).toEqual(mockUserResponse);
        expect(mockUsersService.read).toHaveBeenCalledWith(5, undefined);
      });

      it('should allow user to read their own account by id', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);
        mockUsersService.read.mockResolvedValue(mockUserResponse);

        const result = await controller.read(
          { id: 2 },
          'Bearer customer.token',
        );

        expect(result).toEqual(mockUserResponse);
        expect(mockUsersService.read).toHaveBeenCalledWith(2, undefined);
      });

      it('should throw ForbiddenException if user tries to read other user by id', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.read({ id: 5 }, 'Bearer customer.token'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.read({ id: 5 }, 'Bearer customer.token'),
        ).rejects.toThrow(
          'only admins can see all users, and users can only see their own account',
        );
      });
    });

    describe('reading by username', () => {
      it('should allow ADMIN to read any user by username', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
        mockUsersService.read.mockResolvedValue(mockUserResponse);

        const result = await controller.read(
          { username: 'customer' },
          'Bearer admin.token',
        );

        expect(result).toEqual(mockUserResponse);
        expect(mockUsersService.read).toHaveBeenCalledWith(
          undefined,
          'customer',
        );
      });

      it('should allow user to read their own account by username', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);
        mockUsersService.read.mockResolvedValue(mockUserResponse);

        const result = await controller.read(
          { username: 'customer' },
          'Bearer customer.token',
        );

        expect(result).toEqual(mockUserResponse);
        expect(mockUsersService.read).toHaveBeenCalledWith(
          undefined,
          'customer',
        );
      });

      it('should throw ForbiddenException if user tries to read other user by username', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.read({ username: 'admin' }, 'Bearer customer.token'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.read({ username: 'admin' }, 'Bearer customer.token'),
        ).rejects.toThrow(
          'only admins can see all users, and users can only see their own account',
        );
      });
    });
  });

  describe('Security - Update User Authorization', () => {
    const updateDto: UpdateUserDto = {
      username: 'updatedname',
    };

    it('should throw BadRequestException if no data provided', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);

      await expect(
        controller.update(
          2,
          null as unknown as UpdateUserDto,
          'Bearer admin.token',
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update(
          2,
          null as unknown as UpdateUserDto,
          'Bearer admin.token',
        ),
      ).rejects.toThrow('no data provided to update');
    });

    it('should throw BadRequestException if no valid fields provided', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);

      await expect(
        controller.update(2, {}, 'Bearer admin.token'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update(2, {}, 'Bearer admin.token'),
      ).rejects.toThrow('no valid fields provided to update');
    });

    it('should throw UnauthorizedException if not logged in', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);

      await expect(
        controller.update(2, updateDto, 'Bearer invalid'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        controller.update(2, updateDto, 'Bearer invalid'),
      ).rejects.toThrow('you must be logged in to update users');
    });

    it('should allow ADMIN to update any user', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockUsersService.update.mockResolvedValue({
        ...mockUserResponse,
        username: 'updatedname',
      });

      const result = await controller.update(
        5,
        updateDto,
        'Bearer admin.token',
      );

      expect(result.username).toBe('updatedname');
      expect(mockUsersService.update).toHaveBeenCalledWith(5, updateDto);
    });

    it('should allow user to update their own account', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);
      mockUsersService.update.mockResolvedValue({
        ...mockUserResponse,
        username: 'updatedname',
      });

      const result = await controller.update(
        2,
        updateDto,
        'Bearer customer.token',
      );

      expect(result.username).toBe('updatedname');
      expect(mockUsersService.update).toHaveBeenCalledWith(2, updateDto);
    });

    it('should throw ForbiddenException if user tries to update other user', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

      await expect(
        controller.update(5, updateDto, 'Bearer customer.token'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.update(5, updateDto, 'Bearer customer.token'),
      ).rejects.toThrow(
        'only admins can update all users, and users can only update their own account',
      );
    });

    describe('role updates', () => {
      it('should throw ForbiddenException if non-admin tries to update role', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.update(
            2,
            { role: $Enums.Role.ADMIN },
            'Bearer customer.token',
          ),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.update(
            2,
            { role: $Enums.Role.ADMIN },
            'Bearer customer.token',
          ),
        ).rejects.toThrow('only admins can update user roles');
      });

      it('should allow ADMIN to update user role', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
        mockUsersService.update.mockResolvedValue({
          ...mockUserResponse,
          role: $Enums.Role.ADMIN,
        });

        const result = await controller.update(
          2,
          { role: $Enums.Role.ADMIN },
          'Bearer admin.token',
        );

        expect(result.role).toBe($Enums.Role.ADMIN);
        expect(mockUsersService.update).toHaveBeenCalledWith(2, {
          role: $Enums.Role.ADMIN,
        });
      });

      it('should block CUSTOMER from promoting self to ADMIN', async () => {
        mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

        await expect(
          controller.update(
            2,
            { role: $Enums.Role.ADMIN },
            'Bearer customer.token',
          ),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Security - Delete User Authorization', () => {
    it('should throw UnauthorizedException if not logged in', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);

      await expect(controller.delete(2, 'Bearer invalid')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.delete(2, 'Bearer invalid')).rejects.toThrow(
        'you must be logged in to delete users',
      );
    });

    it('should allow ADMIN to delete any user', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete(5, 'Bearer admin.token');

      expect(mockUsersService.delete).toHaveBeenCalledWith(5);
    });

    it('should allow user to delete their own account', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete(2, 'Bearer customer.token');

      expect(mockUsersService.delete).toHaveBeenCalledWith(2);
    });

    it('should throw ForbiddenException if user tries to delete other user', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

      await expect(
        controller.delete(5, 'Bearer customer.token'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.delete(5, 'Bearer customer.token'),
      ).rejects.toThrow(
        'only admins can delete all users, and users can only delete their own account',
      );
    });

    it('should allow CUSTOMER to self-delete', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete(2, 'Bearer customer.token');

      expect(mockUsersService.delete).toHaveBeenCalledWith(2);
    });

    it('should allow ANONYMOUS to self-delete', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAnonymousAuth);
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete(3, 'Bearer anonymous.token');

      expect(mockUsersService.delete).toHaveBeenCalledWith(3);
    });
  });

  describe('Security - Input Sanitization', () => {
    it('should handle XSS attempt in username', async () => {
      const dto = plainToInstance(CreateUserDto, {
        username: '<script>alert("xss")</script>',
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should handle SQL injection in username', async () => {
      const dto = plainToInstance(CreateUserDto, {
        username: "admin' OR '1'='1",
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should handle null byte injection', async () => {
      const dto = plainToInstance(CreateUserDto, {
        username: 'admin\0',
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Data Pipeline - Controller to Service', () => {
    it('should pass create data to service unchanged', async () => {
      const createDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
      };
      const response = {
        ...mockUserResponse,
        username: 'newuser',
        token: 'new.token',
      };
      mockUsersService.create.mockResolvedValue(response);

      await controller.create(createDto, '');

      expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
    });

    it('should convert id to number in read query', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockUsersService.read.mockResolvedValue(mockUserResponse);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const query: ReadUserDto = { id: '5' as any };

      await controller.read(query, 'Bearer admin.token');

      expect(mockUsersService.read).toHaveBeenCalledWith(5, undefined);
    });

    it('should propagate service errors to caller', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockUsersService.read.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.read({ id: 999 }, 'Bearer admin.token'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Security - Role Hierarchy', () => {
    it('ADMIN should have highest privileges - can manage all users', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAdminAuth);
      mockUsersService.read.mockResolvedValue(mockUserResponse);
      mockUsersService.update.mockResolvedValue(mockUserResponse);
      mockUsersService.delete.mockResolvedValue(undefined);

      // Can read any user
      await controller.read({ id: 999 }, 'Bearer admin.token');
      expect(mockUsersService.read).toHaveBeenCalled();

      // Can update any user
      await controller.update(999, { username: 'test' }, 'Bearer admin.token');
      expect(mockUsersService.update).toHaveBeenCalled();

      // Can delete any user
      await controller.delete(999, 'Bearer admin.token');
      expect(mockUsersService.delete).toHaveBeenCalled();
    });

    it('CUSTOMER should have limited privileges - only own account', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockCustomerAuth);

      // Cannot read all users
      await expect(
        controller.read({}, 'Bearer customer.token'),
      ).rejects.toThrow(ForbiddenException);

      // Cannot read other users
      await expect(
        controller.read({ id: 999 }, 'Bearer customer.token'),
      ).rejects.toThrow(ForbiddenException);

      // Cannot update other users
      await expect(
        controller.update(999, { username: 'test' }, 'Bearer customer.token'),
      ).rejects.toThrow(ForbiddenException);

      // Cannot delete other users
      await expect(
        controller.delete(999, 'Bearer customer.token'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ANONYMOUS should have same privileges as CUSTOMER', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(mockAnonymousAuth);
      mockUsersService.read.mockResolvedValue({
        ...mockUserResponse,
        id: 3,
        username: 'guest',
        role: $Enums.Role.ANONYMOUS,
      });

      // Can read own account
      await controller.read({ id: 3 }, 'Bearer anonymous.token');
      expect(mockUsersService.read).toHaveBeenCalledWith(3, undefined);

      // Cannot read other users
      await expect(
        controller.read({ id: 999 }, 'Bearer anonymous.token'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
