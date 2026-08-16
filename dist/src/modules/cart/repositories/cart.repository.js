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
exports.CartRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let CartRepository = class CartRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOrCreateCart(userId) {
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
    async findCartItem(cartId, variantId) {
        return this.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: { cartId, variantId },
            },
        });
    }
    async findCartItemById(itemId) {
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
    async upsertCartItem(cartId, variantId, quantity) {
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
    async updateItemQuantity(itemId, quantity) {
        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
    }
    async deleteItem(itemId) {
        return this.prisma.cartItem.delete({
            where: { id: itemId },
        });
    }
    async clearCart(cartId) {
        return this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
};
exports.CartRepository = CartRepository;
exports.CartRepository = CartRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartRepository);
//# sourceMappingURL=cart.repository.js.map