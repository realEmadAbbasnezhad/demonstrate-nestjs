import { Test, TestingModule } from '@nestjs/testing';
import { GatewayRestController } from './gateway-rest.controller';
import { GatewayRestService } from './gateway-rest.service';

describe('GatewayRestController', () => {
  let gatewayRestController: GatewayRestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayRestController],
      providers: [GatewayRestService],
    }).compile();

    gatewayRestController = app.get<GatewayRestController>(GatewayRestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gatewayRestController.getHello()).toBe('Hello World!');
    });
  });
});
