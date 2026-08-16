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
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let OrdersRepository = class OrdersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                address: true,
                user: { select: { id: true, name: true, email: true, phone: true } },
                statusHistory: { orderBy: { createdAt: 'desc' } },
            },
        });
    }
    async findByIdempotencyKey(key) {
        return this.prisma.order.findUnique({
            where: { idempotencyKey: key },
            include: {
                items: true,
                address: true,
            },
        });
    }
    async findByOrderNumber(orderNumber) {
        return this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                items: true,
                address: true,
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
    }
    async findUserOrders(userId, query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? query.limit : 20;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (query.status) {
            where.status = query.status;
        }
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    address: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findAllAdmin(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? query.limit : 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.paymentStatus) {
            where.paymentStatus = query.paymentStatus;
        }
        if (query.orderNumber) {
            where.orderNumber = { contains: query.orderNumber, mode: 'insensitive' };
        }
        if (query.search) {
            where.OR = [
                { orderNumber: { contains: query.search, mode: 'insensitive' } },
                { user: { name: { contains: query.search, mode: 'insensitive' } } },
                { user: { email: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        if (query.dateFrom || query.dateTo) {
            where.createdAt = {
                ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            };
        }
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    address: true,
                    user: { select: { id: true, name: true, email: true, phone: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateStatus(orderId, fromStatus, toStatus, changedBy, reason) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id: orderId },
                data: { status: toStatus },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    fromStatus,
                    toStatus,
                    changedBy,
                    reason,
                },
            });
            return order;
        });
    }
    async updatePaymentStatus(orderId, paymentStatus) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus },
        });
    }
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map