import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import {
  type AuthParamDto,
  AuthParamResponseDto,
  type LoginDto,
  LoginResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { AuthService } from '../providers/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthCommands.AuthLogin)
  check(@Payload() payload: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(payload);
  }

  @MessagePattern(AuthCommands.AuthProcessAuthParam)
  processAuthParam(
    @Payload() payload: AuthParamDto,
  ): Promise<AuthParamResponseDto> {
    return this.authService.processAuthParam(payload);
  }
}
