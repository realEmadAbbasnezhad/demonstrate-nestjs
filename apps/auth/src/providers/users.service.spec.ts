import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@auth/providers/users.service';
import { HashService } from '@common/hash/hash.service';
import { $Enums, Prisma, User } from '@prisma/generated/auth';
import {
  CreateUserDto,
  ReadUserDto,
  UpdateUserDto,
} from '@contracts/microservice/auth/users.dto';

describe('UsersService - Business Logic', () => {
  let service: UsersService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  // Mock user data for testing
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password_hash: 'hashedpassword123',
    role: $Enums.Role.CUSTOMER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockAdminUser: User = {
    id: 2,
    username: 'admin',
    password_hash: 'hashedadminpass',
    role: $Enums.Role.ADMIN,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - User Creation', () => {
    describe('successful creation', () => {
      it('should create a user with default ANONYMOUS role when role is not provided', async () => {
        const createUserDto: CreateUserDto = {
          username: 'newuser',
          password: 'password123',
        };

        const mockNewUser: User = {
          id: 3,
          username: 'newuser',
          password_hash: 'hashedpassword123',
          role: $Enums.Role.ANONYMOUS,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        mockHashService.hash.mockResolvedValue('hashedpassword123');
        jest
          .spyOn(service as any, '_userCreate')
          .mockResolvedValue(mockNewUser);
        mockJwtService.signAsync.mockResolvedValue('jwt_token_123');

        const result = await service.create(createUserDto);

        expect(mockHashService.hash).toHaveBeenCalledWith('password123');
        expect(result.token).toBe('jwt_token_123');
        expect(result.id).toBe(3);
        expect(result.username).toBe('newuser');
        expect(result.role).toBe($Enums.Role.ANONYMOUS);
        // @ts-expect-error it's a test, we know password_hash is not there
        expect(result.password_hash).toBeUndefined();
      });

      it('should create a user with provided role', async () => {
        const createUserDto: CreateUserDto = {
          username: 'adminuser',
          password: 'adminpass123',
          role: $Enums.Role.ADMIN,
        };

        const mockNewUser: User = {
          id: 4,
          username: 'adminuser',
          password_hash: 'hashedadminpass',
          role: $Enums.Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        mockHashService.hash.mockResolvedValue('hashedadminpass');
        jest
          .spyOn(service as any, '_userCreate')
          .mockResolvedValue(mockNewUser);
        mockJwtService.signAsync.mockResolvedValue('admin_jwt_token');

        const result = await service.create(createUserDto);

        expect(result.role).toBe($Enums.Role.ADMIN);
        expect(result.token).toBe('admin_jwt_token');
      });

      it('should hash password before storing', async () => {
        const createUserDto: CreateUserDto = {
          username: 'hashtest',
          password: 'plainpassword',
        };

        mockHashService.hash.mockResolvedValue('hashed_plainpassword');
        jest.spyOn(service as any, '_userCreate').mockResolvedValue({
          ...mockUser,
          id: 5,
          username: 'hashtest',
        } as User);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.create(createUserDto);

        expect(mockHashService.hash).toHaveBeenCalledWith('plainpassword');
      });

      it('should generate JWT token with correct payload', async () => {
        const createUserDto: CreateUserDto = {
          username: 'tokentest',
          password: 'pass123',
        };

        mockHashService.hash.mockResolvedValue('hashedpass');
        jest.spyOn(service as any, '_userCreate').mockResolvedValue({
          id: 6,
          username: 'tokentest',
          password_hash: 'hashedpass',
          role: $Enums.Role.CUSTOMER,
        } as User);
        mockJwtService.signAsync.mockResolvedValue('jwt_token');

        await service.create(createUserDto);

        expect(mockJwtService.signAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 6,
            username: 'tokentest',
            role: $Enums.Role.CUSTOMER,
          }),
        );
      });

      it('should not include password_hash in response', async () => {
        const createUserDto: CreateUserDto = {
          username: 'nopassinresponse',
          password: 'secret',
        };

        mockHashService.hash.mockResolvedValue('hashed_secret');
        jest.spyOn(service as any, '_userCreate').mockResolvedValue({
          id: 7,
          username: 'nopassinresponse',
          password_hash: 'hashed_secret',
          role: $Enums.Role.CUSTOMER,
        } as User);
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.create(createUserDto);

        // @ts-expect-error it's a test, we know password_hash is not there
        expect(result.password_hash).toBeUndefined();
        expect(Object.keys(result)).not.toContain('password_hash');
      });
    });

    describe('conflict handling', () => {
      it('should throw ConflictException when username already exists (P2002)', async () => {
        const createUserDto: CreateUserDto = {
          username: 'existinguser',
          password: 'pass123',
        };

        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
          },
        );

        mockHashService.hash.mockResolvedValue('hashedpass');
        jest
          .spyOn(service as any, '_userCreate')
          .mockRejectedValue(prismaError);

        await expect(service.create(createUserDto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.create(createUserDto)).rejects.toThrow(
          'Username already exists',
        );
      });

      it('should throw InternalServerErrorException for other Prisma errors', async () => {
        const createUserDto: CreateUserDto = {
          username: 'erroruser',
          password: 'pass123',
        };

        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Database connection failed',
          {
            code: 'P1000',
            clientVersion: '5.0.0',
          },
        );

        mockHashService.hash.mockResolvedValue('hashedpass');
        jest
          .spyOn(service as any, '_userCreate')
          .mockRejectedValue(prismaError);

        await expect(service.create(createUserDto)).rejects.toThrow(
          InternalServerErrorException,
        );
        await expect(service.create(createUserDto)).rejects.toThrow(
          'Failed to create user',
        );
      });

      it('should throw InternalServerErrorException for unexpected errors', async () => {
        const createUserDto: CreateUserDto = {
          username: 'unexpecteduser',
          password: 'pass123',
        };

        mockHashService.hash.mockResolvedValue('hashedpass');
        jest
          .spyOn(service as any, '_userCreate')
          .mockRejectedValue(new Error('Unknown error'));

        await expect(service.create(createUserDto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('read - User Retrieval', () => {
    describe('read by id', () => {
      it('should return user when found by id', async () => {
        const readUserDto: ReadUserDto = { id: 1 };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);

        const result = await service.read(readUserDto);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
        expect(result[0].username).toBe('testuser');
        // @ts-expect-error it's a test, we know password_hash is not there
        expect(result[0].password_hash).toBeUndefined();
      });

      it('should throw NotFoundException when user not found by id', async () => {
        const readUserDto: ReadUserDto = { id: 999 };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(null);

        await expect(service.read(readUserDto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.read(readUserDto)).rejects.toThrow(
          'Id not founded',
        );
      });
    });

    describe('read by username', () => {
      it('should return user when found by username', async () => {
        const readUserDto: ReadUserDto = { username: 'testuser' };

        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockUser);

        const result = await service.read(readUserDto);

        expect(result).toHaveLength(1);
        expect(result[0].username).toBe('testuser');
        // @ts-expect-error it's a test, we know password_hash is not there
        expect(result[0].password_hash).toBeUndefined();
      });

      it('should throw NotFoundException when user not found by username', async () => {
        const readUserDto: ReadUserDto = { username: 'nonexistent' };

        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(null);

        await expect(service.read(readUserDto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.read(readUserDto)).rejects.toThrow(
          'Username not founded',
        );
      });

      it('should prioritize id over username when both are provided', async () => {
        const readUserDto: ReadUserDto = { id: 1, username: 'other' };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        jest
          .spyOn(service as any, '_readUserByUsername')
          .mockResolvedValue(mockAdminUser);

        const result = await service.read(readUserDto);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
        expect(service['_readUserById']).toHaveBeenCalled();
        expect(service['_readUserByUsername']).not.toHaveBeenCalled();
      });
    });

    describe('read all users', () => {
      it('should return all users when no filter provided', async () => {
        const readUserDto: ReadUserDto = {};
        const allUsers = [mockUser, mockAdminUser];

        jest.spyOn(service as any, '_readAllUser').mockResolvedValue(allUsers);

        const result = await service.read(readUserDto);

        expect(result).toHaveLength(2);
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 1, username: 'testuser' }),
            expect.objectContaining({ id: 2, username: 'admin' }),
          ]),
        );
      });

      it('should return empty array when no users exist', async () => {
        const readUserDto: ReadUserDto = {};

        jest.spyOn(service as any, '_readAllUser').mockResolvedValue([]);

        const result = await service.read(readUserDto);

        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      });

      it('should not include password_hash in any returned users', async () => {
        const readUserDto: ReadUserDto = {};
        const allUsers = [mockUser, mockAdminUser];

        jest.spyOn(service as any, '_readAllUser').mockResolvedValue(allUsers);

        const result = await service.read(readUserDto);

        result.forEach((user) => {
          // @ts-expect-error it's a test, we know password_hash is not there
          expect(user.password_hash).toBeUndefined();
        });
      });
    });
  });

  describe('update - User Modification', () => {
    describe('successful updates', () => {
      it('should update username', async () => {
        const updateUserDto: UpdateUserDto = {
          username: 'newusername',
        };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        const updatedUser = { ...mockUser, username: 'newusername' };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        const result = await service.update(1, updateUserDto);

        expect(result.username).toBe('newusername');
        // @ts-expect-error it's a test, we know password_hash is not there
        expect(result.password_hash).toBeUndefined();
      });

      it('should update password and hash it', async () => {
        const updateUserDto: UpdateUserDto = {
          password: 'newpassword123',
        };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        mockHashService.hash.mockResolvedValue('hashed_newpassword');

        const updatedUser = {
          ...mockUser,
          password_hash: 'hashed_newpassword',
        };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        await service.update(1, updateUserDto);

        expect(mockHashService.hash).toHaveBeenCalledWith('newpassword123');
      });

      it('should update role', async () => {
        const updateUserDto: UpdateUserDto = {
          role: $Enums.Role.ADMIN,
        };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        const updatedUser = { ...mockUser, role: $Enums.Role.ADMIN };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        const result = await service.update(1, updateUserDto);

        expect(result.role).toBe($Enums.Role.ADMIN);
      });

      it('should update multiple fields at once', async () => {
        const updateUserDto: UpdateUserDto = {
          username: 'newuser',
          password: 'newpass',
          role: $Enums.Role.CUSTOMER,
        };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        mockHashService.hash.mockResolvedValue('hashed_newpass');

        const updatedUser: User = {
          ...mockUser,
          username: 'newuser',
          password_hash: 'hashed_newpass',
          role: $Enums.Role.CUSTOMER,
        };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        const result = await service.update(1, updateUserDto);

        expect(result.username).toBe('newuser');
        expect(result.role).toBe($Enums.Role.CUSTOMER);
        expect(mockHashService.hash).toHaveBeenCalled();
      });

      it('should not include password_hash in response', async () => {
        const updateUserDto: UpdateUserDto = {
          username: 'updated',
        };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        const updatedUser = { ...mockUser, username: 'updated' };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        const result = await service.update(1, updateUserDto);

        // @ts-expect-error it's a test, we know password_hash is not there
        expect(result.password_hash).toBeUndefined();
      });
    });

    describe('error handling', () => {
      it('should throw NotFoundException when user does not exist', async () => {
        const updateUserDto: UpdateUserDto = {
          username: 'newname',
        };

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(null);

        await expect(service.update(999, updateUserDto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.update(999, updateUserDto)).rejects.toThrow(
          'Id not founded',
        );
      });

      it('should not update when no fields are provided', async () => {
        const updateUserDto: UpdateUserDto = {};

        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        jest.spyOn(service as any, '_updateUser').mockResolvedValue(mockUser);

        const result = await service.update(1, updateUserDto);

        expect(result).toBeDefined();
        expect(service['_updateUser']).toHaveBeenCalled();
      });
    });
  });

  describe('delete - User Deletion', () => {
    describe('successful deletion', () => {
      it('should delete user and return null', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        jest.spyOn(service as any, '_deleteUser').mockResolvedValue(mockUser);

        const result = await service.delete(1);

        expect(result).toBeNull();
        expect(service['_deleteUser']).toHaveBeenCalledWith(1);
      });

      it('should call delete with correct user id', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        jest.spyOn(service as any, '_deleteUser').mockResolvedValue(mockUser);

        await service.delete(1);

        expect(service['_deleteUser']).toHaveBeenCalledWith(1);
      });
    });

    describe('error handling', () => {
      it('should throw NotFoundException when user does not exist', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(null);

        await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        await expect(service.delete(999)).rejects.toThrow('Id not founded');
      });

      it('should not call delete method when user not found', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(null);
        jest.spyOn(service as any, '_deleteUser');

        try {
          await service.delete(999);
        } catch {
          // Expected error
        }

        expect(service['_deleteUser']).not.toHaveBeenCalled();
      });
    });
  });

  describe('Data Pipeline & Security', () => {
    describe('password handling', () => {
      it('should never expose password_hash in create response', async () => {
        const createUserDto: CreateUserDto = {
          username: 'testuser',
          password: 'testpass',
        };

        mockHashService.hash.mockResolvedValue('hashed');
        jest
          .spyOn(service as any, '_userCreate')
          .mockResolvedValue({ ...mockUser, password_hash: 'hashed' });
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.create(createUserDto);

        expect(result).not.toHaveProperty('password_hash');
      });

      it('should never expose password_hash in read response', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);

        const result = await service.read({ id: 1 });

        expect(result[0]).not.toHaveProperty('password_hash');
      });

      it('should never expose password_hash in update response', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue({ ...mockUser, password_hash: 'newhash' });

        const result = await service.update(1, { username: 'new' });

        expect(result).not.toHaveProperty('password_hash');
      });
    });

    describe('role handling', () => {
      it('should correctly set role in JWT payload', async () => {
        const createUserDto: CreateUserDto = {
          username: 'admin',
          password: 'pass',
          role: $Enums.Role.ADMIN,
        };

        mockHashService.hash.mockResolvedValue('hashed');
        jest.spyOn(service as any, '_userCreate').mockResolvedValue({
          id: 1,
          username: 'admin',
          password_hash: 'hashed',
          role: $Enums.Role.ADMIN,
        } as User);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.create(createUserDto);

        const jwtPayload = (
          mockJwtService.signAsync.mock.calls as unknown[] as Array<unknown[]>
        )[0]?.[0] as Record<string, unknown>;
        expect(jwtPayload?.role).toBe($Enums.Role.ADMIN);
      });

      it('should handle role updates correctly', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        const updatedUser = { ...mockUser, role: $Enums.Role.ADMIN };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        const result = await service.update(1, {
          role: $Enums.Role.ADMIN,
        });

        expect(result.role).toBe($Enums.Role.ADMIN);
      });
    });

    describe('input validation', () => {
      it('should hash password input before storing', async () => {
        const createUserDto: CreateUserDto = {
          username: 'user',
          password: 'plaintext',
        };

        mockHashService.hash.mockResolvedValue('hashed');
        jest.spyOn(service as any, '_userCreate').mockResolvedValue({
          ...mockUser,
          password_hash: 'hashed',
        } as User);
        mockJwtService.signAsync.mockResolvedValue('token');

        await service.create(createUserDto);

        expect(mockHashService.hash).toHaveBeenCalledWith('plaintext');
      });

      it('should handle username changes', async () => {
        jest.spyOn(service as any, '_readUserById').mockResolvedValue(mockUser);
        const updatedUser = { ...mockUser, username: 'changedname' };
        jest
          .spyOn(service as any, '_updateUser')
          .mockResolvedValue(updatedUser);

        const result = await service.update(1, { username: 'changedname' });

        expect(result.username).toBe('changedname');
      });
    });
  });
});
