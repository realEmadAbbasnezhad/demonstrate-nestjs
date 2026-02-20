import { PrismaClient } from '@prisma/generated/order';

export class OrderRepository {
  protected prisma: PrismaClient;

  protected constructor() {
    this.prisma = new PrismaClient();
  }
}
