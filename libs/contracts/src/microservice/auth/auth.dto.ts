import { $Enums } from '@prisma/generated/auth';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class JwtPayloadDto {
  id: number;
  role: $Enums.Role;
}

export class LoginDto {
  @ApiProperty({
    description: 'username of user',
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
export class LoginResponseDto {
  id: number;
  username: string;
  role: $Enums.Role;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  token: string;
}

export type AuthParamDto = string;
export type AuthParamResponseDto = JwtPayloadDto | null;
