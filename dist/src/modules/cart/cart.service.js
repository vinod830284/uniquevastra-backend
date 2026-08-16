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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const cart_repository_1 = require("./repositories/cart.repository");
const pricing_service_1 = require("../pricing/pricing.service");
const prisma_service_1 = require("../../database/prisma.service");
let CartService = class CartService {
    repository;
    pricingService;
    prisma;
    constructor(repository, pricingService, prisma) {
        this.repository = repository;
        this.pricingService = pricingService;
        this.prisma = prisma;
    }
    async getCart(userId) {
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
    async addItem(userId, dto) {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: dto.variantId },
            include: {
                product: true,
                inventory: true,
            },
        });
        if (!variant || variant.status !== 'ACTIVE') {
            throw new common_1.NotFoundException('Requested product variant is unavailable or does not exist');
        }
        if (!variant.product || variant.product.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Requested product is not currently active');
        }
        const availableStock = variant.inventory
            ? Math.max(0, variant.inventory.stock - variant.inventory.reservedStock)
            : 0;
        const cart = await this.repository.findOrCreateCart(userId);
        const existingItem = await this.repository.findCartItem(cart.id, dto.variantId);
        const targetQuantity = (existingItem?.quantity || 0) + dto.quantity;
        if (availableStock < targetQuantity) {
            throw new common_1.ConflictException({
                message: `Insufficient stock available. Only ${availableStock} units available, but ${targetQuantity} requested.`,
                errorCode: 'INSUFFICIENT_STOCK',
            });
        }
        await this.repository.upsertCartItem(cart.id, dto.variantId, dto.quantity);
        return this.getCart(userId);
    }
    async updateItemQuantity(userId, itemId, dto) {
        const item = await this.repository.findCartItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (item.cart.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this cart item');
        }
        const variant = item.variant;
        const availableStock = variant.inventory
            ? Math.max(0, variant.inventory.stock - variant.inventory.reservedStock)
            : 0;
        if (availableStock < dto.quantity) {
            throw new common_1.ConflictException({
                message: `Insufficient stock available. Only ${availableStock} units available.`,
                errorCode: 'INSUFFICIENT_STOCK',
            });
        }
        await this.repository.updateItemQuantity(itemId, dto.quantity);
        return this.getCart(userId);
    }
    async removeItem(userId, itemId) {
        const item = await this.repository.findCartItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (item.cart.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to remove this cart item');
        }
        await this.repository.deleteItem(itemId);
        return this.getCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.repository.findOrCreateCart(userId);
        await this.repository.clearCart(cart.id);
        return this.getCart(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cart_repository_1.CartRepository,
        pricing_service_1.PricingService,
        prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map