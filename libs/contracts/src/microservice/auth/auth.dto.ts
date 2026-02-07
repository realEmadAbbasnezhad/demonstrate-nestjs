import { $Enums } from '@prisma/generated/auth';
import {
  CreateUserDto,
  CreateUserResponseDto,
} from '@contracts/microservice/auth/users.dto';

export class JwtPayloadDto {
  id: number;
  role: $Enums.Role;
}

export class LoginDto extends CreateUserDto {}
export type LoginResponseDto = CreateUserResponseDto;

export type AuthParamDto = string;
export type AuthResponseDto = JwtPayloadDto | null;
