import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@common/config/config.module';
import { AuthResolver } from '@gateway-graphql/resolvers/auth.resolver';
import { AuthContractsModule } from '@contracts/auth/contracts-auth.module';
import { GatewayExceptionFilter } from '@common-gateway/exception/gateway-exception.filter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { RootResolver } from '@gateway-graphql/resolvers/root.resolver';
import { UserResolver } from '@gateway-graphql/resolvers/user.resolver';
import { ProductResolver } from '@gateway-graphql/resolvers/product.resolver';
import { CatalogContractsModule } from '@contracts/catalog/contracts-catalog.module';

@Module({
  imports: [
    ConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      formatError: (formattedError, rawError) =>
        GatewayExceptionFilter.FormatGraphQLError(formattedError, rawError),

      graphiql: new ConfigService().get<boolean>('ENABLE_GRAPHIQL'),
      path: new ConfigService().get<string>('GRAPHQL_PATH'),
      autoSchemaFile: join(process.cwd(), 'graphql/schema.gql'),
    }),

    AuthContractsModule,
    CatalogContractsModule,
  ],
  controllers: [],
  providers: [AuthResolver, UserResolver, RootResolver, ProductResolver],
})
export class GatewayGraphqlModule {}
