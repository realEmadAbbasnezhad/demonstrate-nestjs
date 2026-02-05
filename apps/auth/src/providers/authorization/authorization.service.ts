import { Injectable } from '@nestjs/common';
import {
  AuthorizationDto,
  AuthorizationResponseDto,
  AuthorizationRole,
  JwtPayloadDto,
} from '@contracts/microservice/auth/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthorizationService {
  constructor(private readonly jwtService: JwtService) {}
  async check(data: AuthorizationDto): Promise<AuthorizationResponseDto> {
    // if requested role is anonymous, allow access without checking token
    if (data.requestedRole === AuthorizationRole.Anonymous) {
      return { authorized: true, message: null };
    }

    // check if token is present in headers
    const [tokenType, token] = data.authorizationHeader.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      return { authorized: false, message: 'Token not found' };
    }

    // verify token
    let payload: JwtPayloadDto;
    try {
      payload = await this.jwtService.verifyAsync(token, {});
    } catch {
      return { authorized: false, message: 'Token is not valid' };
    }

    // check user permission
    switch (payload.role) {
      case AuthorizationRole.Admin:
        return { authorized: true, message: null };
      case AuthorizationRole.Customer:
        if (data.requestedRole !== AuthorizationRole.Admin) {
          return { authorized: true, message: null };
        }
        break;
    }

    // authorization failed
    return { authorized: false, message: 'Insufficient permission' };
  }
}
