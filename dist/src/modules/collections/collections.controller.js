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
exports.AdminCollectionsController = exports.PublicCollectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const collections_service_1 = require("./collections.service");
const create_collection_dto_1 = require("./dto/create-collection.dto");
const update_collection_dto_1 = require("./dto/update-collection.dto");
const collection_product_dto_1 = require("./dto/collection-product.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PublicCollectionsController = class PublicCollectionsController {
    collectionsService;
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    async findAll() {
        return this.collectionsService.findAllPublic();
    }
    async findBySlug(slug) {
        return this.collectionsService.findBySlug(slug);
    }
};
exports.PublicCollectionsController = PublicCollectionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get active collections for customer catalog' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicCollectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active collection and its products by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicCollectionsController.prototype, "findBySlug", null);
exports.PublicCollectionsController = PublicCollectionsController = __decorate([
    (0, swagger_1.ApiTags)('Collections (Public Catalog)'),
    (0, common_1.Controller)('collections'),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService])
], PublicCollectionsController);
let AdminCollectionsController = class AdminCollectionsController {
    collectionsService;
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    async findAll() {
        return this.collectionsService.findAllAdmin();
    }
    async findById(id) {
        return this.collectionsService.findByIdAdmin(id);
    }
    async create(dto) {
        return this.collectionsService.create(dto);
    }
    async update(id, dto) {
        return this.collectionsService.update(id, dto);
    }
    async archive(id) {
        return this.collectionsService.archive(id);
    }
    async addProduct(collectionId, dto) {
        return this.collectionsService.addProduct(collectionId, dto);
    }
    async removeProduct(collectionId, productId) {
        return this.collectionsService.removeProduct(collectionId, productId);
    }
    async reorderProducts(collectionId, dto) {
        return this.collectionsService.reorderProducts(collectionId, dto);
    }
};
exports.AdminCollectionsController = AdminCollectionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all collections including drafts & archived (Admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get collection by ID (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create collection (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collection_dto_1.CreateCollectionDto]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update collection (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_collection_dto_1.UpdateCollectionDto]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive collection (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Add product to collection (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, collection_product_dto_1.AddCollectionProductDto]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Delete)(':id/products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove product from collection (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Patch)(':id/products/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder products within collection (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, collection_product_dto_1.ReorderCollectionProductsDto]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "reorderProducts", null);
exports.AdminCollectionsController = AdminCollectionsController = __decorate([
    (0, swagger_1.ApiTags)('Collections (Admin)'),
    (0, common_1.Controller)('admin/collections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.ADMIN, client_1.AdminRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService])
], AdminCollectionsController);
//# sourceMappingURL=collections.controller.js.map