import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  LoginDto,
  LoginResponseDto,
} from '@contracts/microservice/auth/auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '@contracts/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'login to your account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Password is wrong',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Username is not found',
  })
  @Post()
  public async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }
}
