import { Body, Controller, Post } from '@nestjs/common';
import { SigninDto, SignupDto } from '../providers/auth/auth.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../providers/auth/auth.service';
import { Anonymous } from '../providers/auth/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'create your account hare!' })
  @Anonymous()
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @ApiOperation({ summary: 'login to your account' })
  @Anonymous()
  @Post('signin')
  async signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }
}
