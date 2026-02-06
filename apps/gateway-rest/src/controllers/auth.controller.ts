import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthorizationRole,
  LoginDto,
  LoginResponseDto,
  UserCreateDto,
  UserCreateResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../providers/auth/auth.service';
import { Authorization } from '../providers/auth/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'create your account' })
  @Authorization(AuthorizationRole.Anonymous)
  @Post('user')
  async userCreate(
    @Body() body: UserCreateDto,
  ): Promise<UserCreateResponseDto> {
    return this.authService.userCreate(body);
  }

  @ApiOperation({ summary: 'login to your account' })
  @Authorization(AuthorizationRole.Anonymous)
  @Post('login')
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }
}
