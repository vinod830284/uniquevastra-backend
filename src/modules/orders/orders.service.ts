import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersRepository } from './repositories/orders.repository';
import { PricingService } from '../pricing/pricing.service';
import { InventoryTransactionService } from '../inventory/inventory-transaction.service';
import { CouponsService } from '../coupons/coupons.service';
import { PrismaService } from '../../database/prisma.service';
import { OrderNumberUtil } from './utils/order-number.util';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class OrdersService {
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    SHIPPED: [OrderStatus.OUT_FOR_DELIVERY],
    OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
    DELIVERED: [OrderStatus.RETURN_REQUESTED],
    CANCELLED: [],
    RETURN_REQUESTED: [OrderStatus.RETURNED, OrderStatus.CONFIRMED],
    RETURNED: [OrderStatus.REFUND_PENDING],
    REFUND_PENDING: [OrderStatus.REFUNDED],
    REFUNDED: [],
  };

  constructor(
    private repository: OrdersRepository,
    private pricingService: PricingService,
    private inventoryTransactionService: InventoryTransactionService,
    private couponsService: CouponsService,
    private prisma: PrismaService,
  ) {}

  async previewCheckout(userId: string, addressId?: string, couponCode?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventory: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const pricing = this.pricingService.calculateCartPricing(cart.items);
    let couponDiscount = 0;
    let appliedCoupon: any = null;
    const effectiveCouponCode = couponCode || cart.couponCode;

    if (effectiveCouponCode) {
      try {
        const validated = await this.couponsService.validateCoupon(
          effectiveCouponCode,
          userId,
          pricing.subtotal,
          pricing.deliveryFee,
        );
        couponDiscount = validated.discountAmount;
        appliedCoupon = {
          code: validated.coupon.code,
          type: validated.coupon.type,
          discountAmount: couponDiscount,
        };

        if (validated.freeDelivery) {
          pricing.deliveryFee = 0;
        }
      } catch (err: any) {
        // If preview fails coupon, return reason without throwing 500
        appliedCoupon = { error: err.message };
      }
    }

    const totalPaise = Math.max(
      0,
      PricingService.rupeesToPaise(pricing.subtotal) -
        PricingService.rupeesToPaise(couponDiscount) +
        PricingService.rupeesToPaise(pricing.deliveryFee),
    );
    const total = PricingService.paiseToRupees(totalPaise);

    return {
      items: pricing.items,
      subtotal: pricing.subtotal,
      couponDiscount,
      coupon: appliedCoupon,
      deliveryFee: pricing.deliveryFee,
      total,
      currency: 'INR',
      hasUnavailableItems: pricing.hasUnavailableItems,
    };
  }

  async createOrder(userId: string, dto: CreateOrderDto, idempotencyKey?: string) {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingOrder = await this.repository.findByIdempotencyKey(idempotencyKey);
      if (existingOrder) {
        return existingOrder;
      }
    }

    // 2. Load Cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventory: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty. Add items before checking out.');
    }

    // 3. Load Address
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    });

    if (!address) {
      throw new NotFoundException('Delivery address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('Delivery address does not belong to the current user');
    }

    // 4. Calculate Authoritative Pricing & Re-validate Coupon
    const pricing = this.pricingService.calculateCartPricing(cart.items);

    if (pricing.hasUnavailableItems) {
      const unavailable = pricing.items.filter((i) => !i.available);
      throw new ConflictException({
        message: 'Cart contains unavailable or out-of-stock items',
        errorCode: 'INSUFFICIENT_STOCK',
        items: unavailable,
      });
    }

    let couponDiscount = 0;
    let couponRecord: any = null;

    if (cart.couponCode) {
      const validated = await this.couponsService.validateCoupon(
        cart.couponCode,
        userId,
        pricing.subtotal,
        pricing.deliveryFee,
      );
      couponDiscount = validated.discountAmount;
      couponRecord = validated.coupon;
      if (validated.freeDelivery) {
        pricing.deliveryFee = 0;
      }
    }

    const finalTotalPaise = Math.max(
      0,
      PricingService.rupeesToPaise(pricing.subtotal) -
        PricingService.rupeesToPaise(couponDiscount) +
        PricingService.rupeesToPaise(pricing.deliveryFee),
    );
    const finalTotal = PricingService.paiseToRupees(finalTotalPaise);

    // 5. Execute Order Checkout Transaction
    return this.prisma.$transaction(async (tx) => {
      // a. Reserve Stock for each item
      for (const item of pricing.items) {
        await this.inventoryTransactionService.reserveStock({
          variantId: item.variantId,
          quantity: item.quantity,
          reason: 'Order placement reservation',
          createdBy: userId,
          referenceType: 'ORDER',
        });
      }

      // b. Generate Unique Order Number
      const orderCount = await tx.order.count();
      const orderNumber = OrderNumberUtil.generateOrderNumber(orderCount + 1);

      // c. Create Order Record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: dto.paymentMethod || PaymentMethod.COD,
          idempotencyKey: idempotencyKey || null,
          notes: dto.notes,
          couponCode: cart.couponCode || null,
          couponDiscount,
          subtotal: pricing.subtotal,
          discount: couponDiscount,
          deliveryFee: pricing.deliveryFee,
          total: finalTotal,
        },
      });

      // d. Record Coupon Usage
      if (couponRecord) {
        await tx.couponUsage.create({
          data: {
            couponId: couponRecord.id,
            userId,
            orderId: order.id,
            discountAmount: couponDiscount,
          },
        });
      }

      // e. Create OrderItem Snapshots
      await tx.orderItem.createMany({
        data: pricing.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          sku: item.sku,
          size: item.size,
          color: item.color,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0.0,
          total: item.lineTotal,
        })),
      });

      // f. Create OrderAddress Snapshot
      await tx.orderAddress.create({
        data: {
          orderId: order.id,
          name: address.name,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
      });

      // g. Create OrderStatusHistory Entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.PENDING,
          changedBy: userId,
          reason: 'Order checkout created',
        },
      });

      // h. Clear Customer Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await tx.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          address: true,
        },
      });
    });
  }

  async findUserOrders(userId: string, query: OrderQueryDto) {
    return this.repository.findUserOrders(userId, query);
  }

  async findUserOrderDetail(userId: string, orderId: string) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order');
    }
    return order;
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this order');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        `Order cannot be cancelled in its current status '${order.status}'`,
      );
    }

    for (const item of order.items) {
      await this.inventoryTransactionService.releaseStock({
        variantId: item.variantId,
        quantity: item.quantity,
        reason: reason || 'Order cancelled by customer',
        createdBy: userId,
        referenceType: 'ORDER_CANCEL',
        referenceId: order.id,
      });
    }

    return this.repository.updateStatus(
      order.id,
      order.status,
      OrderStatus.CANCELLED,
      userId,
      reason || 'Cancelled by customer',
    );
  }

  async findAllAdmin(query: OrderQueryDto) {
    return this.repository.findAllAdmin(query);
  }

  async findByIdAdmin(orderId: string) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatusAdmin(orderId: string, dto: UpdateOrderStatusDto, adminUserId: string) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const currentStatus = order.status;
    const nextStatus = dto.status;

    if (currentStatus === nextStatus) {
      return order;
    }

    const allowedNextStatuses = OrdersService.VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${nextStatus}'`,
      );
    }

    if (nextStatus === OrderStatus.CANCELLED && currentStatus !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.inventoryTransactionService.releaseStock({
          variantId: item.variantId,
          quantity: item.quantity,
          reason: dto.reason || 'Order cancelled by admin',
          createdBy: adminUserId,
          referenceType: 'ADMIN_CANCEL',
          referenceId: order.id,
        });
      }
    }

    return this.repository.updateStatus(
      order.id,
      currentStatus,
      nextStatus,
      adminUserId,
      dto.reason,
    );
  }
}
