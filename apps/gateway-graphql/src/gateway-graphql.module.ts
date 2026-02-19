import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@common/config/config.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthContractsModule } from '@contracts/auth/contracts-auth.module';
import { GatewayExceptionFilter } from '@common-gateway/exception/gateway-exception.filter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { RootResolver } from './resolvers/root.resolver';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [
    ConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      formatError: (formattedError, rawError) =>
        GatewayExceptionFilter.FormatGraphQLError(formattedError, rawError),

      graphiql: new ConfigService().get<boolean>('ENABLE_GRAPHIQL'),
      path: new ConfigService().get<string>('GRAPHIQL_PATH'),
      autoSchemaFile: join(process.cwd(), 'graphql/schema.gql'),
    }),

    AuthContractsModule,
  ],
  controllers: [],
  providers: [AuthResolver, UserResolver, RootResolver],
})
export class GatewayGraphqlModule {}
