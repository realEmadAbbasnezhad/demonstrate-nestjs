import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayRestService {
  getHello(): string {
    return 'Hello World!';
  }
}
