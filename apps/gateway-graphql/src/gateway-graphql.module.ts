import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@common/config/config.module';
import { AuthResolver, HealthResolver } from './resolvers/auth.resolver';
import { AuthContractsModule } from '@contracts/auth/contracts-auth.module';
import { GatewayExceptionFilter } from '@common-gateway/exception/gateway-exception.filter';

@Module({
  imports: [
    ConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      formatError: (formattedError, rawError) =>
        GatewayExceptionFilter.FormatGraphQLError(formattedError, rawError),

      graphiql: true,
      autoSchemaFile: true,
      debug: false,
    }),

    AuthContractsModule,
  ],
  controllers: [],
  providers: [AuthResolver, HealthResolver],
})
export class GatewayGraphqlModule {}
