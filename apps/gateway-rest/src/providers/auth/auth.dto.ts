import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthorizationRole } from '@contracts/microservice/auth/auth.dto';

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
