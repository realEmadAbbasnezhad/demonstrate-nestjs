import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '@common/hash/hash.service';
import { PrismaAuthService } from '@common/prisma/prisma-auth.service';
import { JwtPayloadDto } from '@contracts/microservice/auth/auth.dto';
import {
  CreateUserDto,
  CreateUserResponseDto,
  FindUserDto,
  FindUserResponseDto,
  UpdateUserDto,
} from '@contracts/microservice/auth/users.dto';
import { $Enums, Prisma, User } from '@prisma/generated/auth';

@Injectable()
export class UsersService extends UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly _prismaService: PrismaAuthService,
  ) {
    super(_prismaService);
  }

  public async create(body: CreateUserDto): Promise<CreateUserResponseDto> {
    const passwordHash = await this.hashService.hash(body.password);
    // create user
    let newUser: User;
    try {
      newUser = await this._userCreate({
        username: body.username,
        password_hash: passwordHash,
        role: body.role ?? $Enums.Role.ANONYMOUS,
      } as User);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(`Username already exists`);
      }
      throw new InternalServerErrorException(`Failed to create user`);
    }

    // create jwt
    return {
      token: await this.jwtService.signAsync(newUser as JwtPayloadDto),
      username: newUser.username,
      role: newUser.role,
      id: newUser.id,
      createdAt: newUser.createdAt,
      deletedAt: newUser.deletedAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async find(body: FindUserDto): Promise<FindUserResponseDto[]> {
    if (body.id) {
      const user = await this._getUserById(body.id);
      if (!user) throw new NotFoundException('Id not founded');

      return [
        {
          username: user.username,
          role: user.role,
          id: user.id,
          createdAt: user.createdAt,
          deletedAt: user.deletedAt,
          updatedAt: user.updatedAt,
        },
      ];
    }

    if (body.username) {
      const user = await this._getUserByUsername(body.username);
      if (!user) throw new NotFoundException('Username not founded');

      return [
        {
          username: user.username,
          role: user.role,
          id: user.id,
          createdAt: user.createdAt,
          deletedAt: user.deletedAt,
          updatedAt: user.updatedAt,
        },
      ];
    }

    const allUsers = await this._getAllUser();
    return allUsers.map((user) => ({
      username: user.username,
      role: user.role,
      id: user.id,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
      updatedAt: user.updatedAt,
    }));
  }

  async update(id: number, body: UpdateUserDto): Promise<FindUserResponseDto> {
    const user = await this._getUserById(id);
    if (!user) throw new NotFoundException('Id not founded');

    if (body.password) {
      user.password_hash = await this.hashService.hash(body.password);
    }
    if (body.role) {
      user.role = body.role;
    }
    if (body.username) {
      user.username = body.username;
    }
    const updatedUser = await this._updateUser(id, user);
    return {
      username: updatedUser.username,
      role: updatedUser.role,
      id: updatedUser.id,
      createdAt: updatedUser.createdAt,
      deletedAt: updatedUser.deletedAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async remove(id: number): Promise<null> {
    const user = await this._getUserById(id);
    if (!user) throw new NotFoundException('Id not founded');

    await this._deleteUser(id);
    return null;
  }
}
