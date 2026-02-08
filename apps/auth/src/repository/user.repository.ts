import { User } from '@prisma/generated/auth';
import { PrismaService } from '@common/prisma/prisma.service';

export abstract class UserRepository {
  protected constructor(private readonly prismaService: PrismaService) {}

  protected _userCreate(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prismaService.user.create({
      data: { ...user, deletedAt: null },
    });
  }

  protected _getUserByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { username, AND: { deletedAt: null } },
    });
  }

  protected _getUserById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id, AND: { deletedAt: null } },
    });
  }

  protected _getAllUser(): Promise<User[]> {
    return this.prismaService.user.findMany({
      where: { deletedAt: null },
    });
  }

  protected _updateUser(
    id: number,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ): Promise<User> {
    return this.prismaService.user.update({
      where: { id, AND: { deletedAt: null } },
      data: { ...user },
    });
  }

  protected _deleteUser(id: number): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
