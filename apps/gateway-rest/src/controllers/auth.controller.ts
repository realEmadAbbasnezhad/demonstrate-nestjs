import { Body, Controller, Post } from '@nestjs/common';
import {
  LoginDto,
  LoginResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../providers/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'login to your account' })
  @Post()
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }
}
