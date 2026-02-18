import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { Request } from 'express';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthParamDto => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.headers.authorization ?? '';
  },
);
