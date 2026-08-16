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
exports.AdminInventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const inventory_query_dto_1 = require("./dto/inventory-query.dto");
const adjust_stock_dto_1 = require("./dto/adjust-stock.dto");
const reserve_stock_dto_1 = require("./dto/reserve-stock.dto");
const release_stock_dto_1 = require("./dto/release-stock.dto");
const update_threshold_dto_1 = require("./dto/update-threshold.dto");
const bulk_adjust_dto_1 = require("./dto/bulk-adjust.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AdminInventoryController = class AdminInventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getSummary() {
        return this.inventoryService.getSummary();
    }
    async getLowStock(query) {
        return this.inventoryService.getLowStock(query);
    }
    async getOutOfStock(query) {
        return this.inventoryService.getOutOfStock(query);
    }
    async findAll(query) {
        return this.inventoryService.findAllAdmin(query);
    }
    async bulkAdjust(dto, adminUserId) {
        return this.inventoryService.bulkAdjust(dto, adminUserId);
    }
    async findByVariantId(variantId) {
        return this.inventoryService.findByVariantId(variantId);
    }
    async adjustStock(variantId, dto, adminUserId) {
        return this.inventoryService.adjustStock(variantId, dto, adminUserId);
    }
    async reserveStock(variantId, dto, adminUserId) {
        return this.inventoryService.reserveStock(variantId, dto.quantity, dto.reason || 'Admin reservation', adminUserId);
    }
    async releaseStock(variantId, dto, adminUserId) {
        return this.inventoryService.releaseStock(variantId, dto.quantity, dto.reason || 'Admin reservation release', adminUserId);
    }
    async getHistory(variantId) {
        return this.inventoryService.getHistory(variantId);
    }
    async updateThreshold(variantId, dto) {
        return this.inventoryService.updateThreshold(variantId, dto.threshold);
    }
};
exports.AdminInventoryController = AdminInventoryController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get total inventory summary metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of variants in low stock' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_query_dto_1.InventoryQueryDto]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('out-of-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of variants completely out of stock' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_query_dto_1.InventoryQueryDto]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "getOutOfStock", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Query inventory list with filters, search, and pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_query_dto_1.InventoryQueryDto]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('bulk-adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk stock adjustment transactionally (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_adjust_dto_1.BulkAdjustDto, String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "bulkAdjust", null);
__decorate([
    (0, common_1.Get)(':variantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single variant inventory status & calculations' }),
    __param(0, (0, common_1.Param)('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "findByVariantId", null);
__decorate([
    (0, common_1.Post)(':variantId/adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust variant stock (STOCK_IN, STOCK_OUT, CORRECTION, DAMAGE)' }),
    __param(0, (0, common_1.Param)('variantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adjust_stock_dto_1.AdjustStockDto, String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)(':variantId/reserve'),
    (0, swagger_1.ApiOperation)({ summary: 'Reserve stock for checkout (Admin / System)' }),
    __param(0, (0, common_1.Param)('variantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reserve_stock_dto_1.ReserveStockDto, String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "reserveStock", null);
__decorate([
    (0, common_1.Post)(':variantId/release'),
    (0, swagger_1.ApiOperation)({ summary: 'Release reserved stock (Admin / System)' }),
    __param(0, (0, common_1.Param)('variantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, release_stock_dto_1.ReleaseStockDto, String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "releaseStock", null);
__decorate([
    (0, common_1.Get)(':variantId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock audit history for a variant' }),
    __param(0, (0, common_1.Param)('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Patch)(':variantId/threshold'),
    (0, swagger_1.ApiOperation)({ summary: 'Update low stock alert threshold for a variant' }),
    __param(0, (0, common_1.Param)('variantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_threshold_dto_1.UpdateThresholdDto]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "updateThreshold", null);
exports.AdminInventoryController = AdminInventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory Management (Admin)'),
    (0, common_1.Controller)('admin/inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.ADMIN, client_1.AdminRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], AdminInventoryController);
//# sourceMappingURL=inventory.controller.js.map