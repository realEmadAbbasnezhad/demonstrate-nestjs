import { $Enums, User } from '@prisma/generated/auth';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    enum: $Enums.Role,
    description: 'role of new user, it wont apply if caller is not admin',
    example: 'ADMIN',
  })
  @IsEnum($Enums.Role)
  @IsOptional()
  role: $Enums.Role | undefined;
}
export type CreateUserResponseDto = Pick<User, 'password_hash'>;
export type FindUserResponseDto = Omit<User, 'password_hash'>;
export type UpdateUserDto = Partial<CreateUserDto>;
export class FindUserDto {
  id: number | undefined;
  username: string | undefined;
}
