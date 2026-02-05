import { Injectable } from '@nestjs/common';
import {
  AuthenticationResponseDto,
  AuthenticationDto,
} from '@contracts/microservice/auth/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {}
  async check(data: AuthenticationDto): Promise<AuthenticationResponseDto> {
    // check if token is present in headers
    const [tokenType, token] = data.authorizationHeader.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      return { authenticated: false, message: 'Token not found' };
    }

    // verify token
    try {
      await this.jwtService.verifyAsync(token, {});
    } catch {
      return { authenticated: false, message: 'Token is not valid' };
    }

    // authentication successful
    return { authenticated: true, message: null };
  }
}
