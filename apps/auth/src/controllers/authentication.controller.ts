import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import { AuthenticationService } from '../providers/authorization/authentication.service';
import {
  AuthenticationDto,
  AuthenticationResponseDto,
} from '@contracts/microservice/auth/auth.dto';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern(AuthCommands.AuthenticationCheck)
  check(
    @Payload() payload: AuthenticationDto,
  ): Promise<AuthenticationResponseDto> {
    return this.authenticationService.check(payload);
  }
}
