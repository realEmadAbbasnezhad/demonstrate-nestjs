import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ExceptionModule } from '@common/exception/exception.module';
import { ProductsController } from '@catalog/controllers/products.controller';
import { ProductsService } from '@catalog/providers/products.service';

@Module({
  imports: [ConfigModule, ExceptionModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class CatalogModule {}
