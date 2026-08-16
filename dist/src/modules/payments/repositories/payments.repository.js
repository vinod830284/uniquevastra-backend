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
exports.PaymentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsRepository = class PaymentsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.payment.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true } },
                        items: true,
                    },
                },
                events: { orderBy: { createdAt: 'desc' } },
            },
        });
    }
    async findByProviderOrderId(providerOrderId) {
        return this.prisma.payment.findFirst({
            where: { providerOrderId },
            include: { order: { include: { items: true } } },
        });
    }
    async findOrderPayments(orderId) {
        return this.prisma.payment.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
            include: { events: { orderBy: { createdAt: 'desc' } } },
        });
    }
    async createPayment(data) {
        return this.prisma.payment.create({ data });
    }
    async updatePaymentStatus(id, status, providerPaymentId, failureReason) {
        return this.prisma.payment.update({
            where: { id },
            data: {
                status,
                ...(providerPaymentId ? { providerPaymentId } : {}),
                ...(failureReason ? { failureReason } : {}),
            },
        });
    }
    async createEvent(paymentId, eventType, providerEventId, metadata) {
        if (providerEventId) {
            const existing = await this.prisma.paymentEvent.findUnique({
                where: { providerEventId },
            });
            if (existing)
                return existing;
        }
        return this.prisma.paymentEvent.create({
            data: {
                paymentId,
                eventType,
                providerEventId,
                metadata: metadata || client_1.Prisma.JsonNull,
            },
        });
    }
    async findAllAdmin(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? query.limit : 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.method)
            where.method = query.method;
        if (query.provider)
            where.provider = query.provider;
        if (query.orderId)
            where.orderId = query.orderId;
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        select: { id: true, orderNumber: true, user: { select: { name: true, email: true } } },
                    },
                },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.PaymentsRepository = PaymentsRepository;
exports.PaymentsRepository = PaymentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsRepository);
//# sourceMappingURL=payments.repository.js.map