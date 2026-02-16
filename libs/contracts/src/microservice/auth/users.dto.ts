import { $Enums } from '@prisma/generated/auth';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
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

  @ApiPropertyOptional({
    enum: $Enums.Role,
    description: 'role of new user, it wont apply if caller is not admin',
    example: 'ADMIN',
  })
  @IsEnum($Enums.Role)
  @IsOptional()
  role?: $Enums.Role;
}

export class CreateUserResponseDto {
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
    description: 'JWT token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}

export class ReadUserResponseDto {
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
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'username of user',
    example: 'admin',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username can only contain letters and numbers',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'a strong password for your user',
    example: 'password',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    enum: $Enums.Role,
    description: 'role of new user, it wont apply if caller is not admin',
    example: 'ADMIN',
  })
  @IsEnum($Enums.Role)
  @IsOptional()
  role?: $Enums.Role;
}

export class ReadUserDto {
  @ApiPropertyOptional({
    description: 'User identifier',
    example: 1,
  })
  @IsOptional()
  @IsString()
  id?: number;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  username?: string;
}

export type UpdateUserMicroserviceDto = UpdateUserDto & { id: number };
