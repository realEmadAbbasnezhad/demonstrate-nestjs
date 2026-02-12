import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ExceptionModule } from '@common/exception/exception.module';
import { ProductsController } from '@catalog/controllers/products.controller';
import { ProductsService } from '@catalog/providers/products.service';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ConfigModule,
    ExceptionModule,
    CacheModule.register({
      store: new KeyvRedis(
        new ConfigService().get<string>('REDIS_URL') as string,
      ),
      ttl: 60 * 30, // 30 min
    }),
    ElasticsearchModule.register({
      node: new ConfigService().get<string>('ES_URL') as string,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class CatalogModule {}
