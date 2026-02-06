import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export enum AuthorizationRole {
  Anonymous = 'ANONYMOUS',
  Customer = 'CUSTOMER',
  Admin = 'ADMIN',
}
export class AuthorizationDto {
  // raw authorization header
  authorizationHeader: string;

  // role being requested
  requestedRole: AuthorizationRole;
}
export class AuthenticationDto {
  // raw authorization header
  authorizationHeader: string;
}

export class JwtPayloadDto {
  role: AuthorizationRole;
  username: string;
  sub: number;
}

export class UserCreateDto {
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
export class UserCreateResponseDto {
  @ApiProperty({ description: 'JWT token for user' })
  token: string;

  @ApiProperty({ description: 'user information' })
  user: JwtPayloadDto;
}

export class LoginDto extends UserCreateDto {}
export class LoginResponseDto extends UserCreateResponseDto {}
