import { User } from '@prisma/generated/auth';
import { AuthRepository } from '@contracts/prisma/prisma-auth.repository';

export abstract class UserRepository extends AuthRepository {
  protected _userCreate(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data: { ...user, deletedAt: null },
    });
  }

  protected _readUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username, AND: { deletedAt: null } },
    });
  }

  protected _readUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, AND: { deletedAt: null } },
    });
  }

  protected _readAllUser(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
    });
  }

  protected _updateUser(
    id: number,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id, AND: { deletedAt: null } },
      data: { ...user },
    });
  }

  protected _deleteUser(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
