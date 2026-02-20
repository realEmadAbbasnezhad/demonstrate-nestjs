import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from '@order/repository/order.repository';
import { Cart } from '@prisma/generated/order';
import { ClientProxy } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/auth/auth.commands';
import { ReadUserDto } from '@contracts/auth/providers/users.dto';
import { firstValueFrom } from 'rxjs';
import {
  ReadCartResponseDto,
  UpdateCartDto,
} from '@contracts/order/providers/cart.dto';
import { runtimeOmit } from '@common/utils/pick-omit';
import { CatalogCommands } from '@contracts/catalog/catalog.commands';
import { ReadProductResponseDto } from '@contracts/catalog/providers/products.dto';

@Injectable()
export class CartService extends CartRepository {
  public constructor(
    @Inject('AUTH_MICROSERVICE')
    private readonly authMicroservice: ClientProxy,
    @Inject('CATALOG_MICROSERVICE')
    private readonly catalogMicroservice: ClientProxy,
  ) {
    super();
  }

  public async update(
    id: number,
    body: UpdateCartDto,
  ): Promise<ReadCartResponseDto> {
    let targetCart: Cart | null;
    targetCart = await this._readCartByUserId(id);
    if (!targetCart) {
      try {
        await firstValueFrom(
          this.authMicroservice.send(AuthCommands.UsersRead, {
            id,
          } as ReadUserDto),
        );
      } catch {
        throw new NotFoundException("Can't find user with given id");
      }
      targetCart = await this._createCart(id);
    }

    const cartProduct = await this._readCartProduct(id, body.productId);
    if (!cartProduct) {
      if (body.quantity == 0)
        throw new NotFoundException('Cart not do not contain given product');

      let product: ReadProductResponseDto = <ReadProductResponseDto>{};
      try {
        product = await firstValueFrom(
          this.catalogMicroservice.send(
            CatalogCommands.ProductsRead,
            body.productId,
          ),
        );
      } catch {
        throw new NotFoundException("Can't find product with given id");
      }
      if (product.stockCount < body.quantity) {
        throw new BadRequestException(
          'Not enough products in stock to add given quantity to cart',
        );
      }
      await this._createCartProduct(id, body.productId, body.quantity);
    } else {
      if (body.quantity == 0) {
        await this._deleteCartProduct(id, body.productId);
      } else {
        let product: ReadProductResponseDto = <ReadProductResponseDto>{};
        try {
          product = await firstValueFrom(
            this.catalogMicroservice.send(
              CatalogCommands.ProductsRead,
              body.productId,
            ),
          );
        } catch {
          throw new NotFoundException("Can't find product with given id");
        }
        if (product.stockCount < body.quantity) {
          throw new BadRequestException(
            'Not enough products in stock to add given quantity to cart',
          );
        }
        await this._updateCartProduct(id, body.productId, body.quantity);
      }
    }

    targetCart = await this._readCartByUserId(id);
    // @ts-expect-error compiler bitching
    return runtimeOmit(targetCart, ['userId' | 'orderProducts']);
  }

  public async delete(id: number): Promise<null> {
    if (!(await this._readCartByUserId(id)))
      throw new NotFoundException('Id not founded');
    await this._deleteCartByUserId(id);

    return null;
  }

  public async read(id: number): Promise<ReadCartResponseDto> {
    let targetCart: Cart | null;
    try {
      targetCart = await this._readCartByUserId(id);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
    if (!targetCart) {
      throw new NotFoundException("Can't find cart with given id");
    }

    // @ts-expect-error compiler bitching
    return runtimeOmit(targetCart, ['userId']);
  }
}
