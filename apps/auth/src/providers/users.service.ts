import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '@auth/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '@common/hash/hash.service';
import { JwtPayloadDto } from '@contracts/microservice/auth/auth.dto';
import {
  CreateUserDto,
  CreateUserResponseDto,
  ReadUserDto,
  ReadUserResponseDto,
  UpdateUserDto,
} from '@contracts/microservice/auth/users.dto';
import { $Enums, Prisma, User } from '@prisma/generated/auth';
import { runtimeOmit, runtimePick } from '@common/pick-omit';

@Injectable()
export class UsersService extends UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {
    super();
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
      token: await this.jwtService.signAsync(
        runtimePick(newUser, ['id', 'username', 'role']) as JwtPayloadDto,
      ),
      ...runtimeOmit(newUser, ['password_hash']),
    } as CreateUserResponseDto;
  }

  async read(body: ReadUserDto): Promise<ReadUserResponseDto[]> {
    if (body.id) {
      const user = await this._readUserById(body.id);
      if (!user) throw new NotFoundException('Id not founded');

      return [
        // @ts-expect-error compiler bitching
        { ...runtimeOmit(user, ['password_hash']) } as ReadUserResponseDto,
      ];
    }

    if (body.username) {
      const user = await this._readUserByUsername(body.username);
      if (!user) throw new NotFoundException('Username not founded');

      return [
        // @ts-expect-error compiler bitching
        { ...runtimeOmit(user, ['password_hash']) } as ReadUserResponseDto,
      ];
    }

    const allUsers = await this._readAllUser();
    return allUsers.map(
      (user) =>
        // @ts-expect-error compiler bitching
        ({ ...runtimeOmit(user, ['password_hash']) }) as ReadUserResponseDto,
    );
  }

  async update(id: number, body: UpdateUserDto): Promise<ReadUserResponseDto> {
    const user = await this._readUserById(id);
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
    // @ts-expect-error compiler bitching
    return {
      ...runtimeOmit(updatedUser, ['password_hash']),
    } as ReadUserResponseDto;
  }

  async delete(id: number): Promise<null> {
    const user = await this._readUserById(id);
    if (!user) throw new NotFoundException('Id not founded');

    await this._deleteUser(id);
    return null;
  }
}
