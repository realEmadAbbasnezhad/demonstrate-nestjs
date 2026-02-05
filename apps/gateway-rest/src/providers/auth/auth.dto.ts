import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    description: 'username of user, must be unique',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username can only contain letters and numbers',
  })
  username: string;

  @ApiProperty({
    description: 'a strong password for your user',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class SigninDto extends SignupDto {}

export class JwtPayloadDto {
  @ApiProperty({
    description: 'user role',
    example: false,
  })
  role: AuthorizationRole;

  @ApiProperty({ description: 'username of user', example: 'user' })
  username: string;

  @ApiProperty({ description: 'id of user', example: 0 })
  sub: number;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT token for user' })
  token: string;

  @ApiProperty({ description: 'user information' })
  user: JwtPayloadDto;
}

export enum AuthorizationRole {
  Anonymous = 'Anonymous',
  Customer = 'Customer',
  Admin = 'Admin',
}
export class AuthorizationDto {
  // raw authorization header
  authorizationHeader: string;

  // authorization header
  requestedRole: AuthorizationRole;
}
export class AuthorizationRespondDto {
  // does user have permission?
  authorized: boolean;

  @ApiProperty({ description: 'error message, if had' })
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
