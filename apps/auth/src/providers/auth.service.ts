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
import { UserRepository } from '@auth/repository/user.repository';
import { HashService } from '@common/hash/hash.service';
import { runtimeOmit, runtimePick } from '@common/pick-omit';

@Injectable()
export class AuthService extends UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {
    super();
  }

  public async processAuthParam(
    data: AuthParamDto,
  ): Promise<AuthParamResponseDto> {
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
    const user = await this._readUserByUsername(data.username);
    if (!user) throw new NotFoundException('Username is not found');

    // verify password
    if (!(await this.hashService.verify(data.password, user.password_hash)))
      throw new UnauthorizedException('Password is wrong');

    return {
      token: await this.jwtService.signAsync(
        runtimePick(user, ['id', 'username', 'role']) as JwtPayloadDto,
      ),
      ...runtimeOmit(user, ['password_hash']),
    } as LoginResponseDto;
  }
}
