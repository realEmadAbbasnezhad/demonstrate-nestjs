import { Module } from '@nestjs/common';
import { GatewayRestController } from './gateway-rest.controller';
import { GatewayRestService } from './gateway-rest.service';

@Module({
  imports: [],
  controllers: [GatewayRestController],
  providers: [GatewayRestService],
})
export class GatewayRestModule {}
