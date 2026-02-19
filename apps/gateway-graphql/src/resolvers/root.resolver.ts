import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RootResolver {
  @Query(() => String)
  public ping(): string {
    return `pong!`;
  }
}
