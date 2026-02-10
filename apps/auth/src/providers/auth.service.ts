import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthParamDto,
  AuthParamResponseDto,
  JwtPayloadDto,
  LoginDto,
  LoginResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { UserRepository } from '../repository/user.repository';
import { HashService } from '@common/hash/hash.service';

@Injectable()
export class AuthService extends UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {
    super();
  }

  async processAuthParam(data: AuthParamDto): Promise<AuthParamResponseDto> {
    // check if token is present in headers
    const [tokenType, token] = data.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      return null;
    }

    // verify token
    let payload: JwtPayloadDto;
    try {
      payload = await this.jwtService.verifyAsync(token, {});
    } catch {
      return null;
    }
    return payload;
  }

  public async login(data: LoginDto): Promise<LoginResponseDto> {
    const user = await this._getUserByUsername(data.username);
    if (!user) throw new NotFoundException('Username not founded');

    // verify password
    if (!(await this.hashService.verify(data.password, user.password_hash)))
      throw new UnauthorizedException('Password is wrong');

    return {
      token: await this.jwtService.signAsync(user as JwtPayloadDto),
      username: user.username,
      role: user.role,
      id: user.id,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
      updatedAt: user.updatedAt,
    };
  }
}
