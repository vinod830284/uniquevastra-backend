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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCouponsController = exports.PublicCartCouponController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coupons_service_1 = require("./coupons.service");
const create_coupon_dto_1 = require("./dto/create-coupon.dto");
const apply_coupon_dto_1 = require("./dto/apply-coupon.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
let PublicCartCouponController = class PublicCartCouponController {
    couponsService;
    prisma;
    constructor(couponsService, prisma) {
        this.couponsService = couponsService;
        this.prisma = prisma;
    }
    async applyCoupon(userId, dto) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: { include: { product: true } },
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty. Add items before applying coupon.');
        }
        const subtotal = cart.items.reduce((acc, item) => {
            const price = Number(item.variant.price);
            return acc + price * item.quantity;
        }, 0);
        const validation = await this.couponsService.validateCoupon(dto.code, userId, subtotal);
        await this.prisma.cart.update({
            where: { id: cart.id },
            data: { couponCode: validation.coupon.code },
        });
        return {
            message: `Coupon '${validation.coupon.code}' applied successfully`,
            coupon: {
                code: validation.coupon.code,
                type: validation.coupon.type,
                value: Number(validation.coupon.value),
                discountAmount: validation.discountAmount,
            },
        };
    }
    async removeCoupon(userId) {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await this.prisma.cart.update({
                where: { id: cart.id },
                data: { couponCode: null },
            });
        }
        return { message: 'Coupon removed from cart' };
    }
};
exports.PublicCartCouponController = PublicCartCouponController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Apply coupon code to active customer cart' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apply_coupon_dto_1.ApplyCouponDto]),
    __metadata("design:returntype", Promise)
], PublicCartCouponController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Delete)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove applied coupon code from cart' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicCartCouponController.prototype, "removeCoupon", null);
exports.PublicCartCouponController = PublicCartCouponController = __decorate([
    (0, swagger_1.ApiTags)('Cart Coupons (Customer)'),
    (0, common_1.Controller)('cart/coupon'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [coupons_service_1.CouponsService,
        prisma_service_1.PrismaService])
], PublicCartCouponController);
let AdminCouponsController = class AdminCouponsController {
    couponsService;
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async findAll(page = 1, limit = 20) {
        return this.couponsService.findAllAdmin(Number(page), Number(limit));
    }
    async findById(id) {
        return this.couponsService.findByIdAdmin(id);
    }
    async create(dto) {
        return this.couponsService.createCoupon(dto);
    }
    async disable(id) {
        return this.couponsService.disableCoupon(id);
    }
    async enable(id) {
        return this.couponsService.enableCoupon(id);
    }
    async getUsage(id) {
        return this.couponsService.getUsages(id);
    }
};
exports.AdminCouponsController = AdminCouponsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all promotional coupons with pagination (Admin)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get coupon details by ID (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coupon (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable coupon (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "disable", null);
__decorate([
    (0, common_1.Patch)(':id/enable'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable coupon (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "enable", null);
__decorate([
    (0, common_1.Get)(':id/usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit usage history for a coupon (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "getUsage", null);
exports.AdminCouponsController = AdminCouponsController = __decorate([
    (0, swagger_1.ApiTags)('Coupons (Admin)'),
    (0, common_1.Controller)('admin/coupons'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.ADMIN, client_1.AdminRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [coupons_service_1.CouponsService])
], AdminCouponsController);
//# sourceMappingURL=coupons.controller.js.map