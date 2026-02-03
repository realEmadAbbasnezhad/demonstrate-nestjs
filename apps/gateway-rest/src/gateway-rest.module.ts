import { Module } from '@nestjs/common';
import { GatewayRestController } from './gateway-rest.controller';
import { GatewayRestService } from './gateway-rest.service';
import { ConfigModule } from '@common/config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [GatewayRestController],
  providers: [GatewayRestService],
})
export class GatewayRestModule {}
