import { Injectable } from '@nestjs/common';
import {
  AuthenticationResponseDto,
  AuthenticationDto,
} from '@contracts/microservice/auth/auth.dto';

@Injectable()
export class AuthenticationService {
  async check(data: AuthenticationDto): Promise<AuthenticationResponseDto> {
    return { authenticated: false, message: null };
  }
}
