import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryTransactionService, StockOperationOptions } from './inventory-transaction.service';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { BulkAdjustDto } from './dto/bulk-adjust.dto';
import { InventoryStatus, StockAdjustmentType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private repository: InventoryRepository,
    private transactionService: InventoryTransactionService,
  ) {}

  static calculateStatus(stock: number, reservedStock: number, lowStockThreshold: number): InventoryStatus {
    const availableStock = Math.max(0, stock - reservedStock);
    if (availableStock === 0) {
      return InventoryStatus.OUT_OF_STOCK;
    }
    if (availableStock <= lowStockThreshold) {
      return InventoryStatus.LOW_STOCK;
    }
    return InventoryStatus.IN_STOCK;
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
      const status = InventoryService.calculateStatus(item.stock, item.reservedStock, item.lowStockThreshold);
      if (status === InventoryStatus.LOW_STOCK) lowStockVariants++;
      if (status === InventoryStatus.OUT_OF_STOCK) outOfStockVariants++;
    }

    return {
      totalVariants,
      totalUnits,
      lowStockVariants,
      outOfStockVariants,
    };
  }

  async findAllAdmin(query: InventoryQueryDto) {
    const result = await this.repository.findAll(query);
    const formattedItems = result.items.map((item) => {
      const availableStock = Math.max(0, item.stock - item.reservedStock);
      const status = InventoryService.calculateStatus(item.stock, item.reservedStock, item.lowStockThreshold);
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

  async getLowStock(query: InventoryQueryDto) {
    return this.findAllAdmin({ ...query, lowStock: true });
  }

  async getOutOfStock(query: InventoryQueryDto) {
    return this.findAllAdmin({ ...query, outOfStock: true });
  }

  async findByVariantId(variantId: string) {
    const item = await this.repository.findByVariantId(variantId);
    if (!item) {
      throw new NotFoundException(`Inventory for variant '${variantId}' not found`);
    }
    const availableStock = Math.max(0, item.stock - item.reservedStock);
    const status = InventoryService.calculateStatus(item.stock, item.reservedStock, item.lowStockThreshold);
    return {
      ...item,
      availableStock,
      status,
    };
  }

  async adjustStock(variantId: string, dto: AdjustStockDto, adminUserId: string) {
    const opts: StockOperationOptions = {
      variantId,
      quantity: dto.quantity,
      reason: dto.reason,
      createdBy: adminUserId,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
    };

    if (dto.type === StockAdjustmentType.STOCK_IN || dto.type === StockAdjustmentType.CORRECTION) {
      return this.transactionService.increaseStock(opts, dto.type);
    } else {
      return this.transactionService.decreaseStock(opts, dto.type);
    }
  }

  async reserveStock(variantId: string, quantity: number, reason: string, adminUserId: string) {
    return this.transactionService.reserveStock({
      variantId,
      quantity,
      reason,
      createdBy: adminUserId,
    });
  }

  async releaseStock(variantId: string, quantity: number, reason: string, adminUserId: string) {
    return this.transactionService.releaseStock({
      variantId,
      quantity,
      reason,
      createdBy: adminUserId,
    });
  }

  async getHistory(variantId: string) {
    const inventory = await this.repository.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundException(`Inventory for variant '${variantId}' not found`);
    }
    return this.repository.getHistory(inventory.id);
  }

  async updateThreshold(variantId: string, threshold: number) {
    const inventory = await this.repository.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundException(`Inventory for variant '${variantId}' not found`);
    }
    return this.repository.updateThreshold(inventory.id, threshold);
  }

  async bulkAdjust(dto: BulkAdjustDto, adminUserId: string) {
    const items: StockOperationOptions[] = dto.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.type === StockAdjustmentType.STOCK_OUT || i.type === StockAdjustmentType.DAMAGE ? -i.quantity : i.quantity,
      reason: i.reason,
      createdBy: adminUserId,
      referenceType: i.referenceType,
      referenceId: i.referenceId,
    }));

    return this.transactionService.bulkAdjust(items, adminUserId);
  }
}
