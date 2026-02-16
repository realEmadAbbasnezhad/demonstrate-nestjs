import { $Enums } from '@prisma/generated/auth';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class JwtPayloadDto {
  id: number;
  username: string;
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
  @ApiProperty({ description: 'User identifier', example: 1 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'admin' })
  username: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: Object.values($Enums.Role),
    example: 'ADMIN',
  })
  role: $Enums.Role;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
    example: new Date().toISOString(),
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Deletion timestamp if soft-deleted',
    type: String,
    format: 'date-time',
    nullable: true,
    example: null,
  })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'JWT token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}

export type AuthParamDto = string;
export type AuthParamResponseDto = JwtPayloadDto | null;
