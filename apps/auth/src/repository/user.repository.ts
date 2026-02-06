import { User } from '@prisma/generated/auth';
import { PrismaService } from '@common/prisma/prisma.service';

export abstract class UserRepository {
  protected constructor(private readonly prismaService: PrismaService) {}

  protected repoUserCreate(
    user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<User> {
    user.deletedAt = null;
    return this.prismaService.user.create({
      data: { ...user },
    });
  }

  protected getUserByUsername(
    user: Pick<User, 'username'>,
  ): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { username: user.username },
    });
  }
}
