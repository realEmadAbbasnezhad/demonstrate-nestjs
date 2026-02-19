import { $Enums } from '@prisma/generated/auth';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

registerEnumType($Enums.Role, {
  name: 'Role',
});

@InputType()
export class CreateUserDto {
  @ApiProperty({
    description: 'username of user',
    example: 'admin',
  })
  @Field()
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
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    enum: $Enums.Role,
    description: 'role of new user, it wont apply if caller is not admin',
    example: 'ADMIN',
  })
  @Field(() => $Enums.Role, { nullable: true })
  @IsEnum($Enums.Role)
  @IsOptional()
  role?: $Enums.Role;
}

@ObjectType()
export class CreateUserResponseDto {
  @ApiProperty({ description: 'User identifier', example: 1 })
  @Field()
  id: number;

  @ApiProperty({ description: 'Username', example: 'admin' })
  @Field()
  username: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: Object.values($Enums.Role),
    example: 'ADMIN',
  })
  @Field(() => $Enums.Role)
  role: $Enums.Role;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: new Date().toISOString(),
  })
  @Field()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
    example: new Date().toISOString(),
  })
  @Field()
  updatedAt: Date;

  @ApiProperty({
    description: 'Deletion timestamp if soft-deleted',
    type: String,
    format: 'date-time',
    nullable: true,
    example: null,
  })
  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'JWT token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Field()
  token: string;
}

@ObjectType()
export class ReadUserResponseDto {
  @ApiProperty({ description: 'User identifier', example: 1 })
  @Field()
  id: number;

  @ApiProperty({ description: 'Username', example: 'admin' })
  @Field()
  username: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: Object.values($Enums.Role),
    example: 'ADMIN',
  })
  @Field(() => $Enums.Role)
  role: $Enums.Role;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: new Date().toISOString(),
  })
  @Field()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
    example: new Date().toISOString(),
  })
  @Field()
  updatedAt: Date;

  @ApiProperty({
    description: 'Deletion timestamp if soft-deleted',
    type: String,
    format: 'date-time',
    nullable: true,
    example: null,
  })
  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;
}

@InputType()
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'username of user',
    example: 'admin',
  })
  @Field({ nullable: true })
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
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    enum: $Enums.Role,
    description: 'role of new user, it wont apply if caller is not admin',
    example: 'ADMIN',
  })
  @Field(() => $Enums.Role, { nullable: true })
  @IsEnum($Enums.Role)
  @IsOptional()
  role?: $Enums.Role;
}

@InputType()
export class ReadUserDto {
  @ApiPropertyOptional({
    description: 'User identifier',
    example: 1,
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  id?: number;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'admin',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;
}

export type UpdateUserMicroserviceDto = UpdateUserDto & { id: number };
