import { Product } from '@prisma/generated/catalog';
import { CatalogRepository } from '@contracts/prisma/prisma-catalog.repository';
import { SearchProductDto, SearchProductResponseDto } from '@contracts/microservice/catalog/products.dto';

export abstract class ProductsRepository extends CatalogRepository {
  protected _createProduct(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    return this.prisma.product.create({
      data: { ...product, deletedAt: null },
    });
  }

  protected _getProduct(id: string): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { id, AND: { deletedAt: null } },
    });
  }

  protected _updateProduct(
    id: string,
    user: Partial<
      Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id, AND: { deletedAt: null } },
      data: { ...user },
    });
  }

  protected _deleteProduct(id: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
