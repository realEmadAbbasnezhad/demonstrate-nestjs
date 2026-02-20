import { Cart, CartProduct } from '@prisma/generated/order';
import { OrderRepository } from '@contracts/prisma/prisma-order.repository';

export abstract class CartRepository extends OrderRepository {
  protected _createCart(userId: number): Promise<Cart> {
    return this.prisma.cart.create({
      data: { userId },
      include: {
        orderProducts: { select: { productId: true, quantity: true } },
      },
    });
  }

  protected _readCartByUserId(userId: number): Promise<Cart | null> {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: {
        orderProducts: { select: { productId: true, quantity: true } },
      },
    });
  }

  protected async _deleteCartByUserId(userId: number): Promise<void> {
    await this.prisma.cartProduct.deleteMany({
      where: { cartId: userId },
    });
    await this.prisma.cart.delete({
      where: { userId },
    });
    return Promise.resolve();
  }

  protected _readCartProduct(
    userId: number,
    productId: string,
  ): Promise<CartProduct | null> {
    return this.prisma.cartProduct.findFirst({
      where: { cartId: userId, AND: { productId } },
    });
  }

  protected async _updateCartProduct(
    userId: number,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.prisma.cartProduct.updateMany({
      data: { quantity },
      where: { cartId: userId, AND: { productId } },
    });
    return Promise.resolve();
  }

  protected _createCartProduct(
    userId: number,
    productId: string,
    quantity: number,
  ): Promise<CartProduct | null> {
    return this.prisma.cartProduct.create({
      data: { cartId: userId, productId, quantity },
    });
  }

  protected async _deleteCartProduct(
    userId: number,
    productId: string,
  ): Promise<void> {
    await this.prisma.cartProduct.deleteMany({
      where: { cartId: userId, AND: { productId } },
    });
    return Promise.resolve();
  }
}
