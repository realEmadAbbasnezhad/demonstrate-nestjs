export enum AuthorizationRole {
  Anonymous = 'Anonymous',
  Customer = 'Customer',
  Admin = 'Admin',
}
export class AuthorizationDto {
  // raw authorization header
  authorizationHeader: string;

  // role being requested
  requestedRole: AuthorizationRole;
}
export class AuthorizationResponseDto {
  // does user have permission?
  authorized: boolean;

  // error message, if had
  message: string | null;
}
export class AuthenticationDto {
  // raw authorization header
  authorizationHeader: string;
}
export class AuthenticationResponseDto {
  // our user was valid?
  authenticated: boolean;

  // error message, if had
  message: string | null;
}

export class JwtPayloadDto {
  role: AuthorizationRole;
  username: string;
  sub: number;
}
