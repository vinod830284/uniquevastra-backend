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
exports.AdminPaymentsController = exports.PublicPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const verify_payment_dto_1 = require("./dto/verify-payment.dto");
const payment_query_dto_1 = require("./dto/payment-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let PublicPaymentsController = class PublicPaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createPayment(userId, orderId, dto) {
        return this.paymentsService.createPayment(userId, orderId, dto);
    }
    async retryPayment(userId, orderId, dto) {
        return this.paymentsService.createPayment(userId, orderId, dto);
    }
    async verifyPayment(userId, dto) {
        return this.paymentsService.verifyPayment(userId, dto);
    }
    async getOrderPayments(userId, orderId) {
        return this.paymentsService.getOrderPayments(userId, orderId);
    }
    async handleWebhook(signature, payload) {
        const rawBody = JSON.stringify(payload);
        return this.paymentsService.handleWebhook(rawBody, signature || '', payload);
    }
};
exports.PublicPaymentsController = PublicPaymentsController;
__decorate([
    (0, common_1.Post)('orders/:orderId/payment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate payment order attempt for customer order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PublicPaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/payment/retry'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retry payment for unpaid customer order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PublicPaymentsController.prototype, "retryPayment", null);
__decorate([
    (0, common_1.Post)('payments/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Verify payment provider signature and confirm order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, verify_payment_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", Promise)
], PublicPaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('orders/:orderId/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment attempt history for an order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicPaymentsController.prototype, "getOrderPayments", null);
__decorate([
    (0, common_1.Post)('payments/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Public payment provider webhook receiver (Razorpay/HMAC verified)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-razorpay-signature', required: false }),
    __param(0, (0, common_1.Headers)('x-razorpay-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicPaymentsController.prototype, "handleWebhook", null);
exports.PublicPaymentsController = PublicPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments (Customer)'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PublicPaymentsController);
let AdminPaymentsController = class AdminPaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async findAll(query) {
        return this.paymentsService.findAllAdmin(query);
    }
    async findById(id) {
        return this.paymentsService.findByIdAdmin(id);
    }
};
exports.AdminPaymentsController = AdminPaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Query payment attempts with filters and pagination (Admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_query_dto_1.PaymentQueryDto]),
    __metadata("design:returntype", Promise)
], AdminPaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment detail & audit events by ID (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPaymentsController.prototype, "findById", null);
exports.AdminPaymentsController = AdminPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments (Admin)'),
    (0, common_1.Controller)('admin/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.ADMIN, client_1.AdminRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], AdminPaymentsController);
//# sourceMappingURL=payments.controller.js.map