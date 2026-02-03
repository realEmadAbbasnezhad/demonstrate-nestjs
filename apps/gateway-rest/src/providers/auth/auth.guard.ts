import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ANONYMOUS_KEY } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // if action is annotated with @Anonymous, skip authentication
    if (
      this.reflector.getAllAndOverride<boolean>(IS_ANONYMOUS_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;

    // check if token is present in headers
    const request: Request = context.switchToHttp().getRequest();
    const [tokenType, token] =
      request.headers.get('authorization')?.split(' ') ?? [];
    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException();
    }

    return false;
  }
}
