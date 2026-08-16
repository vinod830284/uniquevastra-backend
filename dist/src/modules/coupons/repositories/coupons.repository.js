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
exports.CouponsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let CouponsRepository = class CouponsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByCode(code) {
        const normalizedCode = code.trim().toUpperCase();
        return this.prisma.coupon.findUnique({
            where: { code: normalizedCode },
        });
    }
    async findById(id) {
        return this.prisma.coupon.findUnique({
            where: { id },
            include: {
                _count: { select: { usages: true } },
            },
        });
    }
    async countUserUsages(couponId, userId) {
        return this.prisma.couponUsage.count({
            where: { couponId, userId },
        });
    }
    async countTotalUsages(couponId) {
        return this.prisma.couponUsage.count({
            where: { couponId },
        });
    }
    async create(data) {
        return this.prisma.coupon.create({ data });
    }
    async update(id, data) {
        return this.prisma.coupon.update({
            where: { id },
            data,
        });
    }
    async setStatus(id, status) {
        return this.prisma.coupon.update({
            where: { id },
            data: { status },
        });
    }
    async findAllAdmin(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.coupon.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { usages: true } },
                },
            }),
            this.prisma.coupon.count(),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUsages(couponId, limit = 50) {
        return this.prisma.couponUsage.findMany({
            where: { couponId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { id: true, name: true, email: true } },
                order: { select: { id: true, orderNumber: true, total: true } },
            },
        });
    }
};
exports.CouponsRepository = CouponsRepository;
exports.CouponsRepository = CouponsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponsRepository);
//# sourceMappingURL=coupons.repository.js.map