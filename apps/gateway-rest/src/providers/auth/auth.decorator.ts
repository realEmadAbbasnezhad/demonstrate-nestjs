import { SetMetadata } from '@nestjs/common';

export const IS_ANONYMOUS_KEY = 'isAnonymous';
export const Anonymous = () => SetMetadata(IS_ANONYMOUS_KEY, true);

export const IS_ADMIN_KEY = 'isAdmin';
export const Admin = () => SetMetadata(IS_ADMIN_KEY, true);
