import { PrismaClient } from '@prisma/generated/catalog';

export class CatalogRepository {
  protected prisma: PrismaClient;

  protected constructor() {
    this.prisma = new PrismaClient();
  }
}
