import { Body, Controller, Post } from '@nestjs/common';
import { AuthorizationRole } from '@contracts/microservice/auth/auth.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../providers/auth/auth.service';
import { Authorization } from '../providers/auth/auth.decorator';
import { SigninDto, SignupDto } from '../providers/auth/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'create your account hare!' })
  @Authorization(AuthorizationRole.Anonymous)
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @ApiOperation({ summary: 'login to your account' })
  @Authorization(AuthorizationRole.Anonymous)
  @Post('signin')
  async signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }
}
