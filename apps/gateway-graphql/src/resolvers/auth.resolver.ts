import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LoginDto, LoginResponseDto } from '@contracts/auth/providers/auth.dto';
import { AuthService } from '@contracts/auth/providers/auth.service';

@Resolver('auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponseDto, {
    description: 'Login to your account',
  })
  public async authLogin(
    @Args('input') input: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(input);
  }
}
