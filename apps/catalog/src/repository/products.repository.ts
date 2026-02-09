import { Product } from '@prisma/generated/catalog';
import { PrismaCatalogService } from '@common/prisma/prisma-catalog.service';

export abstract class ProductsRepository {
  protected constructor(private readonly prismaService: PrismaCatalogService) {}

  protected _createProduct(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    return this.prismaService.product.create({
      data: { ...product, deletedAt: null },
    });
  }

  protected _getProduct(id: string): Promise<Product | null> {
    return this.prismaService.product.findFirst({
      where: { id, AND: { deletedAt: null } },
    });
  }

  protected _updateProduct(
    id: string,
    user: Partial<
      Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Product> {
    return this.prismaService.product.update({
      where: { id, AND: { deletedAt: null } },
      data: { ...user },
    });
  }

  protected _deleteProduct(id: string): Promise<Product> {
    return this.prismaService.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
