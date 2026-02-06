import { Module } from '@nestjs/common';
import { MicroserviceExceptionFilter } from '@common/exception/exception.filter';

@Module({
  providers: [MicroserviceExceptionFilter],
  exports: [MicroserviceExceptionFilter],
})
export class ExceptionModule {}
