import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { HashService } from '@common/hash/hash.service';
import { AuthRepository } from '@contracts/prisma/prisma-auth.repository';
import { $Enums, Prisma, User } from '@prisma/generated/auth';

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;
  let hashService: HashService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password_hash: 'hashedPassword123',
    role: $Enums.Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuthRepository = {
    prisma: {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    },
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
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    hashService = module.get<HashService>(HashService);

    // Inject the mock prisma client
    service['prisma'] = mockAuthRepository.prisma as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'newuser',
      password: 'password123',
      role: $Enums.Role.USER,
    };

    it('should create a new user successfully', async () => {
      const mockToken = 'jwt.token.here';
      const hashedPassword = 'hashedPassword123';
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockAuthRepository.prisma.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.create(createUserDto);

      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(mockAuthRepository.prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: createUserDto.username,
          password_hash: hashedPassword,
          role: $Enums.Role.ANONYMOUS,
          deletedAt: null,
        },
      });
      expect(result).toEqual({
        token: mockToken,
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
      });
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should use ANONYMOUS role if role is not provided', async () => {
      const createUserDtoWithoutRole = {
        username: 'newuser',
        password: 'password123',
      };
      const mockToken = 'jwt.token.here';
      const hashedPassword = 'hashedPassword123';
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockAuthRepository.prisma.user.create.mockResolvedValue({
        ...mockUser,
        role: $Enums.Role.ANONYMOUS,
      });
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      await service.create(createUserDtoWithoutRole);

      expect(mockAuthRepository.prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: createUserDtoWithoutRole.username,
          password_hash: hashedPassword,
          role: $Enums.Role.ANONYMOUS,
          deletedAt: null,
        },
      });
    });

    it('should throw ConflictException if username already exists', async () => {
      const hashedPassword = 'hashedPassword123';
      mockHashService.hash.mockResolvedValue(hashedPassword);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.0.0',
        },
      );
      mockAuthRepository.prisma.user.create.mockRejectedValue(prismaError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Username already exists',
      );
    });

    it('should throw InternalServerErrorException on other database errors', async () => {
      const hashedPassword = 'hashedPassword123';
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockAuthRepository.prisma.user.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Failed to create user',
      );
    });
  });

  describe('read', () => {
    it('should find user by id', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.read({ id: 1 });

      expect(mockAuthRepository.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1, AND: { deletedAt: null } },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
      });
      expect(result[0]).not.toHaveProperty('password_hash');
    });

    it('should throw NotFoundException if user id not found', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.read({ id: 999 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.read({ id: 999 })).rejects.toThrow(
        'Id not founded',
      );
    });

    it('should find user by username', async () => {
      mockAuthRepository.prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.read({ username: 'testuser' });

      expect(mockAuthRepository.prisma.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'testuser', AND: { deletedAt: null } },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password_hash');
    });

    it('should throw NotFoundException if username not found', async () => {
      mockAuthRepository.prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.read({ username: 'nonexistent' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.read({ username: 'nonexistent' })).rejects.toThrow(
        'Username not founded',
      );
    });

    it('should return all users if no filter is provided', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 2, username: 'user2' }];
      mockAuthRepository.prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.read({});

      expect(mockAuthRepository.prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password_hash');
      expect(result[1]).not.toHaveProperty('password_hash');
    });
  });

  describe('update', () => {
    const updateUserDto = {
      username: 'updateduser',
      password: 'newpassword',
      role: $Enums.Role.ADMIN,
    };

    it('should throw NotFoundException if user not found', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        'Id not founded',
      );
    });

    it('should update user password', async () => {
      const hashedPassword = 'newHashedPassword';
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockAuthRepository.prisma.user.update.mockResolvedValue({
        ...mockUser,
        password_hash: hashedPassword,
      });

      await service.update(1, { password: 'newpassword' });

      expect(hashService.hash).toHaveBeenCalledWith('newpassword');
      expect(mockAuthRepository.prisma.user.update).toHaveBeenCalled();
    });

    it('should update user role', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockAuthRepository.prisma.user.update.mockResolvedValue({
        ...mockUser,
        role: $Enums.Role.ADMIN,
      });

      const result = await service.update(1, { role: $Enums.Role.ADMIN });

      expect(result.role).toBe($Enums.Role.ADMIN);
    });

    it('should update user username', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockAuthRepository.prisma.user.update.mockResolvedValue({
        ...mockUser,
        username: 'updateduser',
      });

      const result = await service.update(1, { username: 'updateduser' });

      expect(result.username).toBe('updateduser');
    });

    it('should update all user fields at once', async () => {
      const hashedPassword = 'newHashedPassword';
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockHashService.hash.mockResolvedValue(hashedPassword);
      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
        password_hash: hashedPassword,
        role: $Enums.Role.ADMIN,
      };
      mockAuthRepository.prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual({
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        deletedAt: updatedUser.deletedAt,
      });
      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow('Id not founded');
    });

    it('should soft delete user by setting deletedAt', async () => {
      mockAuthRepository.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockAuthRepository.prisma.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.delete(1);

      expect(result).toBeNull();
      expect(mockAuthRepository.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });
});
