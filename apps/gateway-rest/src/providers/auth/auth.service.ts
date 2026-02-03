import { Injectable } from '@nestjs/common';
import { AuthResponseDto, SigninDto, SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  public async signup(data: SignupDto): Promise<AuthResponseDto> {
    return {
      token: data.password,
      user: { admin: false, sub: 0, username: data.username },
    };
  }

  public async signin(data: SigninDto): Promise<AuthResponseDto> {
    return {
      token: data.password,
      user: { admin: false, sub: 0, username: data.username },
    };
  }
}
