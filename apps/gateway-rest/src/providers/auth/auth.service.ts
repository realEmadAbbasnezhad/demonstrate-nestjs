import { Injectable } from '@nestjs/common';
import {
  AuthenticationDto,
  AuthenticationResponseDto,
  AuthorizationDto,
  AuthorizationRespondDto,
  AuthorizationRole,
  AuthResponseDto,
  SigninDto,
  SignupDto,
} from './auth.dto';

@Injectable()
export class AuthService {
  public async signup(data: SignupDto): Promise<AuthResponseDto> {
    return {
      token: data.password,
      user: {
        role: AuthorizationRole.Anonymous,
        sub: 0,
        username: data.username,
      },
    };
  }

  public async signin(data: SigninDto): Promise<AuthResponseDto> {
    return {
      token: data.password,
      user: {
        role: AuthorizationRole.Anonymous,
        sub: 0,
        username: data.username,
      },
    };
  }

  public async authentication(
    data: AuthenticationDto,
  ): Promise<AuthenticationResponseDto> {
    return { authenticated: true, message: null };
  }

  public async authorization(
    data: AuthorizationDto,
  ): Promise<AuthorizationRespondDto> {
    return {
      authorized: false,
      message: null,
    };
  }
}
