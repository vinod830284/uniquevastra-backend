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
exports.InventoryTransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const inventory_constants_1 = require("./constants/inventory.constants");
let InventoryTransactionService = class InventoryTransactionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async increaseStock(opts, type = client_1.StockAdjustmentType.STOCK_IN) {
        if (opts.quantity <= 0) {
            throw new common_1.BadRequestException({
                message: 'Quantity must be greater than 0',
                errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVALID_STOCK_ADJUSTMENT,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { variantId: opts.variantId },
            });
            if (!inventory) {
                throw new common_1.NotFoundException({
                    message: `Inventory for variant '${opts.variantId}' not found`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
                });
            }
            const previousStock = inventory.stock;
            const newStock = previousStock + opts.quantity;
            const updated = await tx.inventory.update({
                where: { id: inventory.id },
                data: { stock: newStock },
            });
            await tx.stockHistory.create({
                data: {
                    inventoryId: inventory.id,
                    type,
                    quantity: opts.quantity,
                    previousStock,
                    newStock,
                    reason: opts.reason,
                    referenceType: opts.referenceType || 'MANUAL_ADJUSTMENT',
                    referenceId: opts.referenceId,
                    createdBy: opts.createdBy,
                },
            });
            return updated;
        });
    }
    async decreaseStock(opts, type = client_1.StockAdjustmentType.STOCK_OUT) {
        if (opts.quantity <= 0) {
            throw new common_1.BadRequestException({
                message: 'Quantity must be greater than 0',
                errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVALID_STOCK_ADJUSTMENT,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { variantId: opts.variantId },
            });
            if (!inventory) {
                throw new common_1.NotFoundException({
                    message: `Inventory for variant '${opts.variantId}' not found`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
                });
            }
            const available = inventory.stock - inventory.reservedStock;
            if (available < opts.quantity) {
                throw new common_1.ConflictException({
                    message: `Insufficient stock available. Required: ${opts.quantity}, Available: ${available}`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
                });
            }
            const previousStock = inventory.stock;
            const newStock = previousStock - opts.quantity;
            const updated = await tx.inventory.update({
                where: { id: inventory.id },
                data: { stock: newStock },
            });
            await tx.stockHistory.create({
                data: {
                    inventoryId: inventory.id,
                    type,
                    quantity: -opts.quantity,
                    previousStock,
                    newStock,
                    reason: opts.reason,
                    referenceType: opts.referenceType || 'MANUAL_ADJUSTMENT',
                    referenceId: opts.referenceId,
                    createdBy: opts.createdBy,
                },
            });
            return updated;
        });
    }
    async reserveStock(opts) {
        if (opts.quantity <= 0) {
            throw new common_1.BadRequestException({
                message: 'Reservation quantity must be greater than 0',
                errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVALID_RESERVATION,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { variantId: opts.variantId },
            });
            if (!inventory) {
                throw new common_1.NotFoundException({
                    message: `Inventory for variant '${opts.variantId}' not found`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
                });
            }
            const available = inventory.stock - inventory.reservedStock;
            if (available < opts.quantity) {
                throw new common_1.ConflictException({
                    message: `Insufficient stock available for reservation. Required: ${opts.quantity}, Available: ${available}`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
                });
            }
            const updated = await tx.inventory.update({
                where: { id: inventory.id },
                data: { reservedStock: { increment: opts.quantity } },
            });
            await tx.stockHistory.create({
                data: {
                    inventoryId: inventory.id,
                    type: client_1.StockAdjustmentType.RESERVATION,
                    quantity: opts.quantity,
                    previousStock: inventory.stock,
                    newStock: inventory.stock,
                    reason: opts.reason || 'Stock reservation',
                    referenceType: opts.referenceType || 'ORDER_RESERVATION',
                    referenceId: opts.referenceId,
                    createdBy: opts.createdBy,
                },
            });
            return updated;
        });
    }
    async releaseStock(opts) {
        if (opts.quantity <= 0) {
            throw new common_1.BadRequestException({
                message: 'Release quantity must be greater than 0',
                errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVALID_RELEASE,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { variantId: opts.variantId },
            });
            if (!inventory) {
                throw new common_1.NotFoundException({
                    message: `Inventory for variant '${opts.variantId}' not found`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
                });
            }
            if (inventory.reservedStock < opts.quantity) {
                throw new common_1.BadRequestException({
                    message: `Cannot release more stock than currently reserved. Reserved: ${inventory.reservedStock}, Requested: ${opts.quantity}`,
                    errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVALID_RELEASE,
                });
            }
            const updated = await tx.inventory.update({
                where: { id: inventory.id },
                data: { reservedStock: { decrement: opts.quantity } },
            });
            await tx.stockHistory.create({
                data: {
                    inventoryId: inventory.id,
                    type: client_1.StockAdjustmentType.RELEASE,
                    quantity: -opts.quantity,
                    previousStock: inventory.stock,
                    newStock: inventory.stock,
                    reason: opts.reason || 'Stock reservation release',
                    referenceType: opts.referenceType || 'ORDER_RELEASE',
                    referenceId: opts.referenceId,
                    createdBy: opts.createdBy,
                },
            });
            return updated;
        });
    }
    async bulkAdjust(items, createdBy) {
        return this.prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of items) {
                const inventory = await tx.inventory.findUnique({
                    where: { variantId: item.variantId },
                });
                if (!inventory) {
                    throw new common_1.NotFoundException({
                        message: `Inventory for variant '${item.variantId}' not found during bulk processing`,
                        errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
                    });
                }
                const previousStock = inventory.stock;
                const newStock = previousStock + item.quantity;
                if (newStock < 0) {
                    throw new common_1.ConflictException({
                        message: `Bulk adjustment resulting in negative stock for variant '${item.variantId}'`,
                        errorCode: inventory_constants_1.INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
                    });
                }
                const updated = await tx.inventory.update({
                    where: { id: inventory.id },
                    data: { stock: newStock },
                });
                await tx.stockHistory.create({
                    data: {
                        inventoryId: inventory.id,
                        type: item.quantity >= 0 ? client_1.StockAdjustmentType.STOCK_IN : client_1.StockAdjustmentType.STOCK_OUT,
                        quantity: item.quantity,
                        previousStock,
                        newStock,
                        reason: item.reason,
                        referenceType: item.referenceType || 'BULK_IMPORT',
                        referenceId: item.referenceId,
                        createdBy,
                    },
                });
                results.push(updated);
            }
            return results;
        });
    }
};
exports.InventoryTransactionService = InventoryTransactionService;
exports.InventoryTransactionService = InventoryTransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryTransactionService);
//# sourceMappingURL=inventory-transaction.service.js.map