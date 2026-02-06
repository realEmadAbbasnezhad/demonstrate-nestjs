import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthorizationRole } from '@contracts/microservice/auth/auth.dto';
import { AUTHORIZATION_KEY } from './auth.decorator';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorizationHeader = request.headers.authorization ?? '';
    const requiredRoles = this.reflector.getAllAndOverride<AuthorizationRole[]>(
      AUTHORIZATION_KEY,
      [context.getHandler(), context.getClass()],
    );
    let highestRequestedRole: AuthorizationRole | null = null;
    if (requiredRoles.includes(AuthorizationRole.Admin)) {
      highestRequestedRole = AuthorizationRole.Admin;
    } else if (requiredRoles.includes(AuthorizationRole.Customer)) {
      highestRequestedRole = AuthorizationRole.Customer;
    } else if (requiredRoles.includes(AuthorizationRole.Anonymous)) {
      highestRequestedRole = AuthorizationRole.Anonymous;
    }
    if (highestRequestedRole === null) {
      throw new InternalServerErrorException('No role declared for route');
    }

    // skip authentication for anonymous routes
    if (highestRequestedRole !== AuthorizationRole.Anonymous) {
      await this.authService.authentication({
        authorizationHeader: authorizationHeader,
      });
    }
    await this.authService.authorization({
      authorizationHeader: authorizationHeader,
      requestedRole: highestRequestedRole,
    });

    return true;
  }
}
