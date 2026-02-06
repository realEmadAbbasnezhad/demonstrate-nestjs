import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticationDto,
  AuthorizationRole,
  JwtPayloadDto,
  LoginDto,
  LoginResponseDto,
  UserCreateDto,
  UserCreateResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../repository/user.repository';
import { HashService } from '@common/hash/hash.service';
import { Prisma, User } from '@prisma/generated/auth';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class AuthenticationService extends UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly _prismaService: PrismaService,
  ) {
    super(_prismaService);
  }

  async check(data: AuthenticationDto): Promise<null> {
    // check if token is present in headers
    const [tokenType, token] = data.authorizationHeader.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException('Token not found');
    }

    // verify token
    try {
      await this.jwtService.verifyAsync(token, {});
    } catch {
      throw new UnauthorizedException('Token is not valid');
    }

    // authentication successful
    return null;
  }

  async userCreate(data: UserCreateDto): Promise<UserCreateResponseDto> {
    const passwordHash = await this.hashService.hash(data.password);
    // create user
    let newUser: User;
    try {
      newUser = await this.repoUserCreate({
        username: data.username,
        password_hash: passwordHash,
        role: AuthorizationRole.Anonymous,
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
    const payload = {
      username: newUser.username,
      sub: newUser.id,
      role: AuthorizationRole.Anonymous,
    } as JwtPayloadDto;
    return {
      token: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  public async login(data: LoginDto): Promise<LoginResponseDto> {
    // find user by username
    const user: User | null = await this.getUserByUsername({
      username: data.username,
    });
    if (!user) throw new NotFoundException('Username not founded');

    // verify password
    if (!(await this.hashService.verify(data.password, user.password_hash)))
      throw new UnauthorizedException('Password is wrong');

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    } as JwtPayloadDto;
    return {
      token: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }
}
