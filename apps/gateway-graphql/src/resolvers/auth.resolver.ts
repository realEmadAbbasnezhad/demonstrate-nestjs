import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { LoginDto, LoginResponseDto } from '@contracts/auth/providers/auth.dto';
import { AuthService } from '@contracts/auth/providers/auth.service';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponseDto, {
    description: 'Login to your account',
  })
  async login(@Args('input') input: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(input);
  }
}

@Resolver()
export class HealthResolver {
  @Query(() => String, { description: 'Health check endpoint' })
  health(): string {
    return 'OK';
  }
}
