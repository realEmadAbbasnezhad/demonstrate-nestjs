import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import { AuthenticationService } from '../providers/authorization/authentication.service';
import {
  AuthenticationDto,
  UserCreateDto,
  UserCreateResponseDto,
  LoginDto,
  LoginResponseDto,
} from '@contracts/microservice/auth/auth.dto';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern(AuthCommands.AuthenticationCheck)
  check(@Payload() payload: AuthenticationDto): Promise<null> {
    return this.authenticationService.check(payload);
  }

  @MessagePattern(AuthCommands.AuthenticationUserCreate)
  userCreate(
    @Payload() payload: UserCreateDto,
  ): Promise<UserCreateResponseDto> {
    return this.authenticationService.userCreate(payload);
  }

  @MessagePattern(AuthCommands.AuthenticationLogin)
  login(@Payload() payload: LoginDto): Promise<LoginResponseDto> {
    return this.authenticationService.login(payload);
  }
}
