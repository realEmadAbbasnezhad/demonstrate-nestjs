import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/generated/catalog';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaCatalogService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    super({adapter: "kir"});
  }
}
