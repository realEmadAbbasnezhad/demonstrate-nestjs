import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthorizationDto,
  AuthorizationRole,
  JwtPayloadDto,
} from '@contracts/microservice/auth/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthorizationService {
  constructor(private readonly jwtService: JwtService) {}
  async check(data: AuthorizationDto): Promise<null> {
    // if requested role is anonymous, allow access without checking token
    if (data.requestedRole === AuthorizationRole.Anonymous) {
      return null;
    }

    // check if token is present in headers
    const [tokenType, token] = data.authorizationHeader.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException('Token not found');
    }

    // verify token
    let payload: JwtPayloadDto;
    try {
      payload = await this.jwtService.verifyAsync(token, {});
    } catch {
      throw new UnauthorizedException('Token is not valid');
    }

    // check user permission
    switch (payload.role) {
      case AuthorizationRole.Admin:
        return null;
      case AuthorizationRole.Customer:
        if (data.requestedRole !== AuthorizationRole.Admin) {
          return null;
        }
        break;
    }

    // authorization failed
    throw new ForbiddenException('Authorization failed');
  }
}
