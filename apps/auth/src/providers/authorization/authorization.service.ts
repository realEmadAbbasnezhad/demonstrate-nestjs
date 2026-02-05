import { Injectable, Logger } from '@nestjs/common';
import {
  AuthorizationDto,
  AuthorizationResponseDto,
} from '@contracts/microservice/auth/auth.dto';

@Injectable()
export class AuthorizationService {
  async check(data: AuthorizationDto): Promise<AuthorizationResponseDto> {
    Logger.log(data, 'AuthorizationService.check');
    return { authorized: false, message: null };
  }
}
