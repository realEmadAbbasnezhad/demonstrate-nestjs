import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UsersService } from '@contracts/auth/providers/users.service';
import { AuthService } from '@contracts/auth/providers/auth.service';
import {
  CreateUserDto,
  CreateUserResponseDto,
  ReadUserResponseDto,
  UpdateUserDto,
} from '@contracts/auth/providers/users.dto';
import { $Enums } from '@prisma/generated/auth';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
describe('UserResolver', () => {
  let resolver: UserResolver;
  const mockUsersService = {
    create: jest.fn(),
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
        UserResolver,
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
    resolver = module.get<UserResolver>(UserResolver);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
  describe('userCreate', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      password: 'password123',
    };
    const expectedResponse: CreateUserResponseDto = {
      id: 1,
      username: 'newuser',
      role: $Enums.Role.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      token: 'mock-jwt-token',
    };
    it('should create a user without role when not authenticated', async () => {
      mockUsersService.create.mockResolvedValue(expectedResponse);
      const result = await resolver.userCreate(createUserDto, 'mock-token');
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResponse);
    });
    it('should create a user with role when authenticated as admin', async () => {
      const createUserWithRole: CreateUserDto = {
        ...createUserDto,
        role: $Enums.Role.ADMIN,
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.create.mockResolvedValue({
        ...expectedResponse,
        role: $Enums.Role.ADMIN,
      });
      const result = await resolver.userCreate(
        createUserWithRole,
        'admin-token',
      );
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserWithRole);
      expect(result.role).toBe($Enums.Role.ADMIN);
    });
    it('should throw UnauthorizedException when trying to set role without authentication', async () => {
      const createUserWithRole: CreateUserDto = {
        ...createUserDto,
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(
        resolver.userCreate(createUserWithRole, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'invalid-token',
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
    it('should throw ForbiddenException when non-admin tries to set role', async () => {
      const createUserWithRole: CreateUserDto = {
        ...createUserDto,
        role: $Enums.Role.ADMIN,
      };
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(
        resolver.userCreate(createUserWithRole, 'user-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'user-token',
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });
  describe('userRead', () => {
    const mockUsers: ReadUserResponseDto[] = [
      {
        id: 1,
        username: 'user1',
        role: $Enums.Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 2,
        username: 'user2',
        role: $Enums.Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    it('should throw UnauthorizedException when not authenticated', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(
        resolver.userRead({ id: 1 }, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.read).not.toHaveBeenCalled();
    });
    it('should allow admin to read all users without filters', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.read.mockResolvedValue(mockUsers);
      const result = await resolver.userRead({}, 'admin-token');
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockUsersService.read).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockUsers);
    });
    it('should throw ForbiddenException when non-admin tries to read all users', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(resolver.userRead({}, 'user-token')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersService.read).not.toHaveBeenCalled();
    });
    it('should allow admin to read user by id', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.read.mockResolvedValue([mockUsers[0]]);
      const result = await resolver.userRead({ id: 1 }, 'admin-token');
      expect(mockUsersService.read).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual([mockUsers[0]]);
    });
    it('should allow user to read their own account by id', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      mockUsersService.read.mockResolvedValue([mockUsers[1]]);
      const result = await resolver.userRead({ id: 2 }, 'user-token');
      expect(mockUsersService.read).toHaveBeenCalledWith(2, undefined);
      expect(result).toEqual([mockUsers[1]]);
    });
    it('should throw ForbiddenException when user tries to read another user by id', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(resolver.userRead({ id: 1 }, 'user-token')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersService.read).not.toHaveBeenCalled();
    });
    it('should allow admin to read user by username', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.read.mockResolvedValue([mockUsers[0]]);
      const result = await resolver.userRead(
        { username: 'user1' },
        'admin-token',
      );
      expect(mockUsersService.read).toHaveBeenCalledWith(undefined, 'user1');
      expect(result).toEqual([mockUsers[0]]);
    });
    it('should allow user to read their own account by username', async () => {
      const userAuth = {
        id: 2,
        username: 'user2',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      mockUsersService.read.mockResolvedValue([mockUsers[1]]);
      const result = await resolver.userRead(
        { username: 'user2' },
        'user-token',
      );
      expect(mockUsersService.read).toHaveBeenCalledWith(undefined, 'user2');
      expect(result).toEqual([mockUsers[1]]);
    });
    it('should throw ForbiddenException when user tries to read another user by username', async () => {
      const userAuth = {
        id: 2,
        username: 'user2',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(
        resolver.userRead({ username: 'user1' }, 'user-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.read).not.toHaveBeenCalled();
    });
  });
  describe('userUpdate', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'updateduser',
      password: 'newpassword123',
    };
    const updatedUser: ReadUserResponseDto = {
      id: 1,
      username: 'updateduser',
      role: $Enums.Role.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    it('should throw BadRequestException when no data provided', async () => {
      await expect(
        resolver.userUpdate(1, {} as UpdateUserDto, 'token'),
      ).rejects.toThrow(BadRequestException);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException when no valid fields provided', async () => {
      await expect(
        resolver.userUpdate(1, {} as UpdateUserDto, 'token'),
      ).rejects.toThrow(BadRequestException);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
    it('should throw UnauthorizedException when not authenticated', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(
        resolver.userUpdate(1, updateUserDto, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
    it('should allow admin to update any user', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.update.mockResolvedValue(updatedUser);
      const result = await resolver.userUpdate(2, updateUserDto, 'admin-token');
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(2, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
    it('should allow user to update their own account', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      mockUsersService.update.mockResolvedValue(updatedUser);
      const result = await resolver.userUpdate(2, updateUserDto, 'user-token');
      expect(mockUsersService.update).toHaveBeenCalledWith(2, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
    it('should throw ForbiddenException when user tries to update another user', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(
        resolver.userUpdate(1, updateUserDto, 'user-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
    it('should allow admin to update user role', async () => {
      const updateWithRole: UpdateUserDto = {
        role: $Enums.Role.ADMIN,
      };
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.update.mockResolvedValue({
        ...updatedUser,
        role: $Enums.Role.ADMIN,
      });
      const result = await resolver.userUpdate(
        2,
        updateWithRole,
        'admin-token',
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(2, updateWithRole);
      expect(result.role).toBe($Enums.Role.ADMIN);
    });
    it('should throw ForbiddenException when non-admin tries to update role', async () => {
      const updateWithRole: UpdateUserDto = {
        username: 'updateduser',
        role: $Enums.Role.ADMIN,
      };
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(
        resolver.userUpdate(2, updateWithRole, 'user-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
    it('should update user with only username', async () => {
      const updateOnlyUsername: UpdateUserDto = {
        username: 'newusername',
      };
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      mockUsersService.update.mockResolvedValue(updatedUser);
      const result = await resolver.userUpdate(
        2,
        updateOnlyUsername,
        'user-token',
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(
        2,
        updateOnlyUsername,
      );
      expect(result).toEqual(updatedUser);
    });
    it('should update user with only password', async () => {
      const updateOnlyPassword: UpdateUserDto = {
        password: 'newpassword123',
      };
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      mockUsersService.update.mockResolvedValue(updatedUser);
      const result = await resolver.userUpdate(
        2,
        updateOnlyPassword,
        'user-token',
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(
        2,
        updateOnlyPassword,
      );
      expect(result).toEqual(updatedUser);
    });
  });
  describe('userDelete', () => {
    it('should throw UnauthorizedException when not authenticated', async () => {
      mockAuthService.processAuthParam.mockResolvedValue(null);
      await expect(resolver.userDelete(1, 'invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.delete).not.toHaveBeenCalled();
    });
    it('should allow admin to delete any user', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.delete.mockResolvedValue(undefined);
      const result = await resolver.userDelete(2, 'admin-token');
      expect(mockAuthService.processAuthParam).toHaveBeenCalledWith(
        'admin-token',
      );
      expect(mockUsersService.delete).toHaveBeenCalledWith(2);
      expect(result).toBe(true);
    });
    it('should allow user to delete their own account', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      mockUsersService.delete.mockResolvedValue(undefined);
      const result = await resolver.userDelete(2, 'user-token');
      expect(mockUsersService.delete).toHaveBeenCalledWith(2);
      expect(result).toBe(true);
    });
    it('should throw ForbiddenException when user tries to delete another user', async () => {
      const userAuth = {
        id: 2,
        username: 'user',
        role: $Enums.Role.CUSTOMER,
      };
      mockAuthService.processAuthParam.mockResolvedValue(userAuth);
      await expect(resolver.userDelete(1, 'user-token')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersService.delete).not.toHaveBeenCalled();
    });
    it('should return true after successful deletion', async () => {
      const adminAuth = {
        id: 1,
        username: 'admin',
        role: $Enums.Role.ADMIN,
      };
      mockAuthService.processAuthParam.mockResolvedValue(adminAuth);
      mockUsersService.delete.mockResolvedValue(undefined);
      const result = await resolver.userDelete(5, 'admin-token');
      expect(result).toBe(true);
      expect(mockUsersService.delete).toHaveBeenCalledWith(5);
    });
  });
});
