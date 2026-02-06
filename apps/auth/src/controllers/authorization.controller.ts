import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import { AuthorizationService } from '../providers/authorization/authorization.service';
import { AuthorizationDto } from '@contracts/microservice/auth/auth.dto';

@Controller()
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @MessagePattern(AuthCommands.AuthorizationCheck)
  check(@Payload() payload: AuthorizationDto): Promise<null> {
    return this.authorizationService.check(payload);
  }
}
