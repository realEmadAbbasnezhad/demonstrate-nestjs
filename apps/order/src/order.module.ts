import { Module } from '@nestjs/common';
import { ConfigModule } from '@common/config/config.module';
import { ExceptionModule } from '@common/exception/exception.module';

@Module({
  imports: [ConfigModule, ExceptionModule],
  controllers: [],
  providers: [],
})
export class OrderModule {}
