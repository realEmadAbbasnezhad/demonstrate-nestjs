import { Module } from '@nestjs/common';
import { PrismaAuthService } from '@common/prisma/prisma-auth.service';
import { ConfigModule } from '@common/config/config.module';
import { PrismaCatalogService } from '@common/prisma/prisma-catalog.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaAuthService, PrismaCatalogService],
  exports: [PrismaAuthService, PrismaCatalogService],
})
export class PrismaModule {}
