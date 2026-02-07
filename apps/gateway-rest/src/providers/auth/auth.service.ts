import { Inject, Injectable } from '@nestjs/common';
import {
  AuthParamDto,
  JwtPayloadDto,
  LoginDto,
  LoginResponseDto,
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

  public login(data: LoginDto): Promise<LoginResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.AuthLogin, data),
    );
  }

  public processAuthParam(auth: AuthParamDto): Promise<JwtPayloadDto | null> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.AuthLogin, auth),
    );
  }
}
