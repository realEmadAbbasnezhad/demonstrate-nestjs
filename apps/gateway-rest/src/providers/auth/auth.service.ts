import { Inject, Injectable } from '@nestjs/common';
import {
  AuthenticationDto,
  AuthorizationDto,
  LoginDto,
  LoginResponseDto,
  UserCreateDto,
  UserCreateResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { ClientProxy } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_MICROSERVICE')
    private readonly authMicroservice: ClientProxy,
  ) {}

  public async userCreate(data: UserCreateDto): Promise<UserCreateResponseDto> {
    return firstValueFrom<UserCreateResponseDto>(
      this.authMicroservice.send(AuthCommands.AuthenticationUserCreate, data),
    );
  }

  public authentication(data: AuthenticationDto): Promise<void> {
    return firstValueFrom<void>(
      this.authMicroservice.send(AuthCommands.AuthenticationCheck, data),
    );
  }

  public authorization(data: AuthorizationDto): Promise<void> {
    return firstValueFrom<void>(
      this.authMicroservice.send(AuthCommands.AuthorizationCheck, data),
    );
  }

  public login(data: LoginDto): Promise<LoginResponseDto> {
    return firstValueFrom<LoginResponseDto>(
      this.authMicroservice.send(AuthCommands.AuthenticationLogin, data),
    );
  }
}
