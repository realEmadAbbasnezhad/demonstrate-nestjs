import { PrismaClient } from '@prisma/generated/auth';

export class AuthRepository {
  protected prisma: PrismaClient;

  protected constructor() {
    this.prisma = new PrismaClient();
  }
}
