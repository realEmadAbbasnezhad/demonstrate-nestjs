import { $Enums } from '@prisma/generated/auth';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

registerEnumType($Enums.Role, {
  name: 'Role',
});

@ObjectType()
export class JwtPayloadDto {
  @Field()
  id: number;

  @Field()
  username: string;

  @Field(() => $Enums.Role)
  role: $Enums.Role;
}

@InputType()
export class LoginDto {
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
}

@ObjectType()
export class LoginResponseDto {
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
    description: 'JWT token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Field()
  token: string;
}

export type AuthParamDto = string;
export type AuthParamResponseDto = JwtPayloadDto | null;
