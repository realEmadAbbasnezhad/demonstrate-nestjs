import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationResponseDto,
  AuthenticationDto,
} from '@contracts/microservice/auth/auth.dto';

@Injectable()
export class AuthenticationService {
  async check(data: AuthenticationDto): Promise<AuthenticationResponseDto> {
    // check if token is present in headers
    const [tokenType, token] = data.authorizationHeader.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException();
    }
    return { authenticated: true, message: null };
  }
}
