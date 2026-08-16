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
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const coupons_repository_1 = require("./repositories/coupons.repository");
const client_1 = require("@prisma/client");
let CouponsService = class CouponsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async validateCoupon(code, userId, subtotal, deliveryFee = 0) {
        const normalizedCode = code.trim().toUpperCase();
        const coupon = await this.repository.findByCode(normalizedCode);
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon code '${normalizedCode}' does not exist`);
        }
        if (coupon.status !== client_1.CouponStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Coupon '${normalizedCode}' is currently inactive or disabled`);
        }
        const now = new Date();
        if (now < coupon.startDate) {
            throw new common_1.BadRequestException(`Coupon '${normalizedCode}' is not active yet`);
        }
        if (now > coupon.endDate) {
            throw new common_1.BadRequestException(`Coupon '${normalizedCode}' has expired`);
        }
        const minOrder = Number(coupon.minimumOrderValue || 0);
        if (subtotal < minOrder) {
            throw new common_1.BadRequestException(`Minimum order value of ₹${minOrder} required to apply coupon '${normalizedCode}'`);
        }
        if (coupon.usageLimit) {
            const totalUsages = await this.repository.countTotalUsages(coupon.id);
            if (totalUsages >= coupon.usageLimit) {
                throw new common_1.BadRequestException(`Coupon '${normalizedCode}' global usage limit has been reached`);
            }
        }
        if (coupon.perUserLimit) {
            const userUsages = await this.repository.countUserUsages(coupon.id, userId);
            if (userUsages >= coupon.perUserLimit) {
                throw new common_1.BadRequestException(`You have reached the redemption limit for coupon '${normalizedCode}'`);
            }
        }
        let discountAmount = 0;
        let freeDelivery = false;
        const value = Number(coupon.value);
        if (coupon.type === client_1.CouponType.PERCENTAGE) {
            let rawDiscount = (subtotal * value) / 100;
            if (coupon.maximumDiscount) {
                rawDiscount = Math.min(rawDiscount, Number(coupon.maximumDiscount));
            }
            discountAmount = Math.min(rawDiscount, subtotal);
        }
        else if (coupon.type === client_1.CouponType.FIXED) {
            discountAmount = Math.min(value, subtotal);
        }
        else if (coupon.type === client_1.CouponType.FREE_DELIVERY) {
            discountAmount = deliveryFee;
            freeDelivery = true;
        }
        return {
            coupon,
            discountAmount: Number(discountAmount.toFixed(2)),
            freeDelivery,
        };
    }
    async createCoupon(dto) {
        const normalizedCode = dto.code.trim().toUpperCase();
        const existing = await this.repository.findByCode(normalizedCode);
        if (existing) {
            throw new common_1.ConflictException(`Coupon code '${normalizedCode}' already exists`);
        }
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('startDate cannot be after endDate');
        }
        if (dto.type === client_1.CouponType.PERCENTAGE && dto.value > 100) {
            throw new common_1.BadRequestException('Percentage coupon value cannot exceed 100%');
        }
        return this.repository.create({
            code: normalizedCode,
            type: dto.type,
            value: dto.value,
            minimumOrderValue: dto.minimumOrderValue || 0,
            maximumDiscount: dto.maximumDiscount || null,
            startDate,
            endDate,
            usageLimit: dto.usageLimit || null,
            perUserLimit: dto.perUserLimit || 1,
            status: client_1.CouponStatus.ACTIVE,
        });
    }
    async findAllAdmin(page = 1, limit = 20) {
        return this.repository.findAllAdmin(page, limit);
    }
    async findByIdAdmin(id) {
        const coupon = await this.repository.findById(id);
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with ID '${id}' not found`);
        }
        return coupon;
    }
    async disableCoupon(id) {
        return this.repository.setStatus(id, client_1.CouponStatus.DISABLED);
    }
    async enableCoupon(id) {
        return this.repository.setStatus(id, client_1.CouponStatus.ACTIVE);
    }
    async getUsages(id) {
        return this.repository.getUsages(id);
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [coupons_repository_1.CouponsRepository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map