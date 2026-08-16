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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const inventory_repository_1 = require("./repositories/inventory.repository");
const inventory_transaction_service_1 = require("./inventory-transaction.service");
const client_1 = require("@prisma/client");
let InventoryService = InventoryService_1 = class InventoryService {
    repository;
    transactionService;
    constructor(repository, transactionService) {
        this.repository = repository;
        this.transactionService = transactionService;
    }
    static calculateStatus(stock, reservedStock, lowStockThreshold) {
        const availableStock = Math.max(0, stock - reservedStock);
        if (availableStock === 0) {
            return client_1.InventoryStatus.OUT_OF_STOCK;
        }
        if (availableStock <= lowStockThreshold) {
            return client_1.InventoryStatus.LOW_STOCK;
        }
        return client_1.InventoryStatus.IN_STOCK;
    }
    async getSummary() {
        const result = await this.repository.findAll({ page: 1, limit: 10000 });
        const items = result.items;
        let totalVariants = items.length;
        let totalUnits = 0;
        let lowStockVariants = 0;
        let outOfStockVariants = 0;
        for (const item of items) {
            totalUnits += item.stock;
            const status = InventoryService_1.calculateStatus(item.stock, item.reservedStock, item.lowStockThreshold);
            if (status === client_1.InventoryStatus.LOW_STOCK)
                lowStockVariants++;
            if (status === client_1.InventoryStatus.OUT_OF_STOCK)
                outOfStockVariants++;
        }
        return {
            totalVariants,
            totalUnits,
            lowStockVariants,
            outOfStockVariants,
        };
    }
    async findAllAdmin(query) {
        const result = await this.repository.findAll(query);
        const formattedItems = result.items.map((item) => {
            const availableStock = Math.max(0, item.stock - item.reservedStock);
            const status = InventoryService_1.calculateStatus(item.stock, item.reservedStock, item.lowStockThreshold);
            return {
                id: item.id,
                variantId: item.variantId,
                sku: item.variant.sku,
                size: item.variant.size,
                color: item.variant.color,
                productName: item.variant.product.name,
                categoryName: item.variant.product.category.name,
                productImage: item.variant.images[0]?.url || item.variant.product.images?.[0]?.url,
                costPrice: item.variant.costPrice ? Number(item.variant.costPrice) : null,
                sellingPrice: Number(item.variant.price),
                stock: item.stock,
                reservedStock: item.reservedStock,
                availableStock,
                lowStockThreshold: item.lowStockThreshold,
                status,
                updatedAt: item.updatedAt.toISOString(),
            };
        });
        return {
            items: formattedItems,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
    async getLowStock(query) {
        return this.findAllAdmin({ ...query, lowStock: true });
    }
    async getOutOfStock(query) {
        return this.findAllAdmin({ ...query, outOfStock: true });
    }
    async findByVariantId(variantId) {
        const item = await this.repository.findByVariantId(variantId);
        if (!item) {
            throw new common_1.NotFoundException(`Inventory for variant '${variantId}' not found`);
        }
        const availableStock = Math.max(0, item.stock - item.reservedStock);
        const status = InventoryService_1.calculateStatus(item.stock, item.reservedStock, item.lowStockThreshold);
        return {
            ...item,
            availableStock,
            status,
        };
    }
    async adjustStock(variantId, dto, adminUserId) {
        const opts = {
            variantId,
            quantity: dto.quantity,
            reason: dto.reason,
            createdBy: adminUserId,
            referenceType: dto.referenceType,
            referenceId: dto.referenceId,
        };
        if (dto.type === client_1.StockAdjustmentType.STOCK_IN || dto.type === client_1.StockAdjustmentType.CORRECTION) {
            return this.transactionService.increaseStock(opts, dto.type);
        }
        else {
            return this.transactionService.decreaseStock(opts, dto.type);
        }
    }
    async reserveStock(variantId, quantity, reason, adminUserId) {
        return this.transactionService.reserveStock({
            variantId,
            quantity,
            reason,
            createdBy: adminUserId,
        });
    }
    async releaseStock(variantId, quantity, reason, adminUserId) {
        return this.transactionService.releaseStock({
            variantId,
            quantity,
            reason,
            createdBy: adminUserId,
        });
    }
    async getHistory(variantId) {
        const inventory = await this.repository.findByVariantId(variantId);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory for variant '${variantId}' not found`);
        }
        return this.repository.getHistory(inventory.id);
    }
    async updateThreshold(variantId, threshold) {
        const inventory = await this.repository.findByVariantId(variantId);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory for variant '${variantId}' not found`);
        }
        return this.repository.updateThreshold(inventory.id, threshold);
    }
    async bulkAdjust(dto, adminUserId) {
        const items = dto.items.map((i) => ({
            variantId: i.variantId,
            quantity: i.type === client_1.StockAdjustmentType.STOCK_OUT || i.type === client_1.StockAdjustmentType.DAMAGE ? -i.quantity : i.quantity,
            reason: i.reason,
            createdBy: adminUserId,
            referenceType: i.referenceType,
            referenceId: i.referenceId,
        }));
        return this.transactionService.bulkAdjust(items, adminUserId);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_repository_1.InventoryRepository,
        inventory_transaction_service_1.InventoryTransactionService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map