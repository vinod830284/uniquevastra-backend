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
exports.InventoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let InventoryRepository = class InventoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByVariantId(variantId) {
        return this.prisma.inventory.findUnique({
            where: { variantId },
            include: {
                variant: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                            },
                        },
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    },
                },
            },
        });
    }
    async findById(id) {
        return this.prisma.inventory.findUnique({
            where: { id },
            include: {
                variant: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                            },
                        },
                    },
                },
            },
        });
    }
    async findAll(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? query.limit : 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.sku) {
            where.variant = { sku: { contains: query.sku, mode: 'insensitive' } };
        }
        if (query.search || query.category || query.size || query.color) {
            where.variant = {
                ...where.variant,
                ...(query.size ? { size: { equals: query.size, mode: 'insensitive' } } : {}),
                ...(query.color ? { color: { contains: query.color, mode: 'insensitive' } } : {}),
                ...(query.search || query.category
                    ? {
                        product: {
                            ...(query.category ? { category: { slug: query.category } } : {}),
                            ...(query.search
                                ? {
                                    OR: [
                                        { name: { contains: query.search, mode: 'insensitive' } },
                                        { slug: { contains: query.search, mode: 'insensitive' } },
                                    ],
                                }
                                : {}),
                        },
                    }
                    : {}),
            };
        }
        const [items, total] = await Promise.all([
            this.prisma.inventory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    category: true,
                                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                                },
                            },
                            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                        },
                    },
                },
            }),
            this.prisma.inventory.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getHistory(inventoryId, limit = 50) {
        return this.prisma.stockHistory.findMany({
            where: { inventoryId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async updateThreshold(id, lowStockThreshold) {
        return this.prisma.inventory.update({
            where: { id },
            data: { lowStockThreshold },
        });
    }
};
exports.InventoryRepository = InventoryRepository;
exports.InventoryRepository = InventoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryRepository);
//# sourceMappingURL=inventory.repository.js.map