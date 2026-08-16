import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './repositories/cart.repository';
import { PricingService } from '../pricing/pricing.service';
import { PrismaService } from '../../database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private repository: CartRepository,
    private pricingService: PricingService,
    private prisma: PrismaService,
  ) {}

  async getCart(userId: string) {
    const cart = await this.repository.findOrCreateCart(userId);
    const pricing = this.pricingService.calculateCartPricing(cart.items);

    return {
      id: cart.id,
      userId: cart.userId,
      items: pricing.items,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      deliveryFee: pricing.deliveryFee,
      freeDeliveryThreshold: pricing.freeDeliveryThreshold,
      total: pricing.total,
      hasUnavailableItems: pricing.hasUnavailableItems,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: {
        product: true,
        inventory: true,
      },
    });

    if (!variant || variant.status !== 'ACTIVE') {
      throw new NotFoundException('Requested product variant is unavailable or does not exist');
    }

    if (!variant.product || variant.product.status !== 'ACTIVE') {
      throw new BadRequestException('Requested product is not currently active');
    }

    const availableStock = variant.inventory
      ? Math.max(0, variant.inventory.stock - variant.inventory.reservedStock)
      : 0;

    const cart = await this.repository.findOrCreateCart(userId);
    const existingItem = await this.repository.findCartItem(cart.id, dto.variantId);

    const targetQuantity = (existingItem?.quantity || 0) + dto.quantity;

    if (availableStock < targetQuantity) {
      throw new ConflictException({
        message: `Insufficient stock available. Only ${availableStock} units available, but ${targetQuantity} requested.`,
        errorCode: 'INSUFFICIENT_STOCK',
      });
    }

    await this.repository.upsertCartItem(cart.id, dto.variantId, dto.quantity);
    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.repository.findCartItemById(itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.cart.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this cart item');
    }

    const variant = item.variant;
    const availableStock = variant.inventory
      ? Math.max(0, variant.inventory.stock - variant.inventory.reservedStock)
      : 0;

    if (availableStock < dto.quantity) {
      throw new ConflictException({
        message: `Insufficient stock available. Only ${availableStock} units available.`,
        errorCode: 'INSUFFICIENT_STOCK',
      });
    }

    await this.repository.updateItemQuantity(itemId, dto.quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.repository.findCartItemById(itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.cart.userId !== userId) {
      throw new ForbiddenException('You do not have permission to remove this cart item');
    }

    await this.repository.deleteItem(itemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.repository.findOrCreateCart(userId);
    await this.repository.clearCart(cart.id);
    return this.getCart(userId);
  }
}
