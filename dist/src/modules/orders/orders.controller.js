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
exports.AdminOrdersController = exports.PublicOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const order_query_dto_1 = require("./dto/order-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let PublicOrdersController = class PublicOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async previewCheckout(userId, addressId, couponCode) {
        return this.ordersService.previewCheckout(userId, addressId, couponCode);
    }
    async createOrder(userId, dto, idempotencyKey) {
        return this.ordersService.createOrder(userId, dto, idempotencyKey);
    }
    async findUserOrders(userId, query) {
        return this.ordersService.findUserOrders(userId, query);
    }
    async findUserOrderDetail(userId, orderId) {
        return this.ordersService.findUserOrderDetail(userId, orderId);
    }
    async cancelOrder(userId, orderId, reason) {
        return this.ordersService.cancelOrder(userId, orderId, reason);
    }
};
exports.PublicOrdersController = PublicOrdersController;
__decorate([
    (0, common_1.Post)('checkout/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview checkout calculation (without creating order or reserving stock)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)('addressId')),
    __param(2, (0, common_1.Body)('couponCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "previewCheckout", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Checkout and create a new order from active cart' }),
    (0, swagger_1.ApiHeader)({ name: 'idempotency-key', required: false, description: 'Optional key to prevent duplicate checkouts' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_dto_1.CreateOrderDto, String]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of authenticated customer orders' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_query_dto_1.OrderQueryDto]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "findUserOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed customer order by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "findUserOrderDetail", null);
__decorate([
    (0, common_1.Post)('orders/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an eligible customer order (releases inventory reservation)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "cancelOrder", null);
exports.PublicOrdersController = PublicOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Checkout & Orders (Customer)'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], PublicOrdersController);
let AdminOrdersController = class AdminOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async findAllAdmin(query) {
        return this.ordersService.findAllAdmin(query);
    }
    async findByIdAdmin(orderId) {
        return this.ordersService.findByIdAdmin(orderId);
    }
    async updateStatus(orderId, dto, adminUserId) {
        return this.ordersService.updateStatusAdmin(orderId, dto, adminUserId);
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Query all customer orders with filters and search (Admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_query_dto_1.OrderQueryDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full admin order detail including status history (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "findByIdAdmin", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status with state machine transition validation (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_1.UpdateOrderStatusDto, String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateStatus", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders (Admin)'),
    (0, common_1.Controller)('admin/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.ADMIN, client_1.AdminRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], AdminOrdersController);
//# sourceMappingURL=orders.controller.js.map