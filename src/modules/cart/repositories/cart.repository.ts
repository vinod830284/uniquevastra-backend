import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private prisma: PrismaService) {}

  async findOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            variant: {
              include: {
                product: { include: { category: true } },
                inventory: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async findCartItem(cartId: string, variantId: string) {
    return this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId, variantId },
      },
    });
  }

  async findCartItemById(itemId: string) {
    return this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        variant: {
          include: {
            product: true,
            inventory: true,
          },
        },
      },
    });
  }

  async upsertCartItem(cartId: string, variantId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId, variantId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId,
        variantId,
        quantity,
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async deleteItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
