import { SetMetadata } from '@nestjs/common';
import { AuthorizationRole } from './auth.dto';

export const AUTHORIZATION_KEY = 'roles';
export const Authorization = (...roles: AuthorizationRole[]) =>
  SetMetadata(AUTHORIZATION_KEY, roles);
