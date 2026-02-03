import { Controller, Get } from '@nestjs/common';
import { GatewayRestService } from './gateway-rest.service';

@Controller()
export class GatewayRestController {
  constructor(private readonly gatewayRestService: GatewayRestService) {}

  @Get()
  getHello(): string {
    return this.gatewayRestService.getHello();
  }
}
