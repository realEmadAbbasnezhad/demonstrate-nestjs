import { Inject, Injectable } from '@nestjs/common';
import { AuthResponseDto, SigninDto, SignupDto } from './auth.dto';
import {
  AuthenticationDto,
  AuthenticationResponseDto,
  AuthorizationDto,
  AuthorizationResponseDto,
  AuthorizationRole,
} from '@contracts/microservice/auth/auth.dto';
import { ClientProxy } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_MICROSERVICE')
    private readonly authMicroService: ClientProxy,
  ) {}
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

  public authentication(
    data: AuthenticationDto,
  ): Promise<AuthenticationResponseDto> {
    return firstValueFrom(
      this.authMicroService.send(AuthCommands.AuthenticationCheck, data),
    );
  }

  public authorization(
    data: AuthorizationDto,
  ): Promise<AuthorizationResponseDto> {
    return firstValueFrom(
      this.authMicroService.send(AuthCommands.AuthorizationCheck, data),
    );
  }
}
