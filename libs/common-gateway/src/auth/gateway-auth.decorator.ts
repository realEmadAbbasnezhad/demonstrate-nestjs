import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { GqlExecutionContext } from '@nestjs/graphql';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthParamDto => {
    const graphQLExecutionContext = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const graphQLContext = graphQLExecutionContext.getContext() as {
      req: { headers?: { authorization?: string } };
    };

    return graphQLContext.req?.headers?.authorization ?? '';
  },
);
