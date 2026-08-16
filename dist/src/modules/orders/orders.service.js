"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const orders_repository_1 = require("./repositories/orders.repository");
const pricing_service_1 = require("../pricing/pricing.service");
const inventory_transaction_service_1 = require("../inventory/inventory-transaction.service");
const coupons_service_1 = require("../coupons/coupons.service");
const prisma_service_1 = require("../../database/prisma.service");
const order_number_util_1 = require("./utils/order-number.util");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    static { OrdersService_1 = this; }
    repository;
    pricingService;
    inventoryTransactionService;
    couponsService;
    prisma;
    static VALID_TRANSITIONS = {
        PENDING: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.CANCELLED],
        CONFIRMED: [client_1.OrderStatus.PROCESSING, client_1.OrderStatus.CANCELLED],
        PROCESSING: [client_1.OrderStatus.SHIPPED, client_1.OrderStatus.CANCELLED],
        SHIPPED: [client_1.OrderStatus.OUT_FOR_DELIVERY],
        OUT_FOR_DELIVERY: [client_1.OrderStatus.DELIVERED],
        DELIVERED: [client_1.OrderStatus.RETURN_REQUESTED],
        CANCELLED: [],
        RETURN_REQUESTED: [client_1.OrderStatus.RETURNED, client_1.OrderStatus.CONFIRMED],
        RETURNED: [client_1.OrderStatus.REFUND_PENDING],
        REFUND_PENDING: [client_1.OrderStatus.REFUNDED],
        REFUNDED: [],
    };
    constructor(repository, pricingService, inventoryTransactionService, couponsService, prisma) {
        this.repository = repository;
        this.pricingService = pricingService;
        this.inventoryTransactionService = inventoryTransactionService;
        this.couponsService = couponsService;
        this.prisma = prisma;
    }
    async previewCheckout(userId, addressId, couponCode) {
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
            throw new common_1.BadRequestException('Cart is empty');
        }
        const pricing = this.pricingService.calculateCartPricing(cart.items);
        let couponDiscount = 0;
        let appliedCoupon = null;
        const effectiveCouponCode = couponCode || cart.couponCode;
        if (effectiveCouponCode) {
            try {
                const validated = await this.couponsService.validateCoupon(effectiveCouponCode, userId, pricing.subtotal, pricing.deliveryFee);
                couponDiscount = validated.discountAmount;
                appliedCoupon = {
                    code: validated.coupon.code,
                    type: validated.coupon.type,
                    discountAmount: couponDiscount,
                };
                if (validated.freeDelivery) {
                    pricing.deliveryFee = 0;
                }
            }
            catch (err) {
                appliedCoupon = { error: err.message };
            }
        }
        const totalPaise = Math.max(0, pricing_service_1.PricingService.rupeesToPaise(pricing.subtotal) -
            pricing_service_1.PricingService.rupeesToPaise(couponDiscount) +
            pricing_service_1.PricingService.rupeesToPaise(pricing.deliveryFee));
        const total = pricing_service_1.PricingService.paiseToRupees(totalPaise);
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
    async createOrder(userId, dto, idempotencyKey) {
        if (idempotencyKey) {
            const existingOrder = await this.repository.findByIdempotencyKey(idempotencyKey);
            if (existingOrder) {
                return existingOrder;
            }
        }
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
            throw new common_1.BadRequestException('Cart is empty. Add items before checking out.');
        }
        const address = await this.prisma.address.findUnique({
            where: { id: dto.addressId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Delivery address not found');
        }
        if (address.userId !== userId) {
            throw new common_1.ForbiddenException('Delivery address does not belong to the current user');
        }
        const pricing = this.pricingService.calculateCartPricing(cart.items);
        if (pricing.hasUnavailableItems) {
            const unavailable = pricing.items.filter((i) => !i.available);
            throw new common_1.ConflictException({
                message: 'Cart contains unavailable or out-of-stock items',
                errorCode: 'INSUFFICIENT_STOCK',
                items: unavailable,
            });
        }
        let couponDiscount = 0;
        let couponRecord = null;
        if (cart.couponCode) {
            const validated = await this.couponsService.validateCoupon(cart.couponCode, userId, pricing.subtotal, pricing.deliveryFee);
            couponDiscount = validated.discountAmount;
            couponRecord = validated.coupon;
            if (validated.freeDelivery) {
                pricing.deliveryFee = 0;
            }
        }
        const finalTotalPaise = Math.max(0, pricing_service_1.PricingService.rupeesToPaise(pricing.subtotal) -
            pricing_service_1.PricingService.rupeesToPaise(couponDiscount) +
            pricing_service_1.PricingService.rupeesToPaise(pricing.deliveryFee));
        const finalTotal = pricing_service_1.PricingService.paiseToRupees(finalTotalPaise);
        return this.prisma.$transaction(async (tx) => {
            for (const item of pricing.items) {
                await this.inventoryTransactionService.reserveStock({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    reason: 'Order placement reservation',
                    createdBy: userId,
                    referenceType: 'ORDER',
                });
            }
            const orderCount = await tx.order.count();
            const orderNumber = order_number_util_1.OrderNumberUtil.generateOrderNumber(orderCount + 1);
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    status: client_1.OrderStatus.PENDING,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    paymentMethod: dto.paymentMethod || client_1.PaymentMethod.COD,
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
            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    fromStatus: client_1.OrderStatus.PENDING,
                    toStatus: client_1.OrderStatus.PENDING,
                    changedBy: userId,
                    reason: 'Order checkout created',
                },
            });
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
    async findUserOrders(userId, query) {
        return this.repository.findUserOrders(userId, query);
    }
    async findUserOrderDetail(userId, orderId) {
        const order = await this.repository.findById(orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this order');
        }
        return order;
    }
    async cancelOrder(userId, orderId, reason) {
        const order = await this.repository.findById(orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to cancel this order');
        }
        if (order.status !== client_1.OrderStatus.PENDING && order.status !== client_1.OrderStatus.CONFIRMED) {
            throw new common_1.BadRequestException(`Order cannot be cancelled in its current status '${order.status}'`);
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
        return this.repository.updateStatus(order.id, order.status, client_1.OrderStatus.CANCELLED, userId, reason || 'Cancelled by customer');
    }
    async findAllAdmin(query) {
        return this.repository.findAllAdmin(query);
    }
    async findByIdAdmin(orderId) {
        const order = await this.repository.findById(orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateStatusAdmin(orderId, dto, adminUserId) {
        const order = await this.repository.findById(orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const currentStatus = order.status;
        const nextStatus = dto.status;
        if (currentStatus === nextStatus) {
            return order;
        }
        const allowedNextStatuses = OrdersService_1.VALID_TRANSITIONS[currentStatus] || [];
        if (!allowedNextStatuses.includes(nextStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from '${currentStatus}' to '${nextStatus}'`);
        }
        if (nextStatus === client_1.OrderStatus.CANCELLED && currentStatus !== client_1.OrderStatus.CANCELLED) {
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
        return this.repository.updateStatus(order.id, currentStatus, nextStatus, adminUserId, dto.reason);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository,
        pricing_service_1.PricingService,
        inventory_transaction_service_1.InventoryTransactionService,
        coupons_service_1.CouponsService,
        prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map