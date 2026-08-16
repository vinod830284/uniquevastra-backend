import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StockAdjustmentType } from '@prisma/client';
import { INVENTORY_ERROR_CODES } from './constants/inventory.constants';

export interface StockOperationOptions {
  variantId: string;
  quantity: number;
  reason: string;
  createdBy?: string;
  referenceType?: string;
  referenceId?: string;
}

@Injectable()
export class InventoryTransactionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Stock Increase (STOCK_IN / CORRECTION)
   */
  async increaseStock(opts: StockOperationOptions, type: StockAdjustmentType = StockAdjustmentType.STOCK_IN) {
    if (opts.quantity <= 0) {
      throw new BadRequestException({
        message: 'Quantity must be greater than 0',
        errorCode: INVENTORY_ERROR_CODES.INVALID_STOCK_ADJUSTMENT,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { variantId: opts.variantId },
      });

      if (!inventory) {
        throw new NotFoundException({
          message: `Inventory for variant '${opts.variantId}' not found`,
          errorCode: INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
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

  /**
   * Atomic Stock Decrease (STOCK_OUT / DAMAGE / CORRECTION) with Concurrency Protection
   */
  async decreaseStock(opts: StockOperationOptions, type: StockAdjustmentType = StockAdjustmentType.STOCK_OUT) {
    if (opts.quantity <= 0) {
      throw new BadRequestException({
        message: 'Quantity must be greater than 0',
        errorCode: INVENTORY_ERROR_CODES.INVALID_STOCK_ADJUSTMENT,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { variantId: opts.variantId },
      });

      if (!inventory) {
        throw new NotFoundException({
          message: `Inventory for variant '${opts.variantId}' not found`,
          errorCode: INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
        });
      }

      const available = inventory.stock - inventory.reservedStock;
      if (available < opts.quantity) {
        throw new ConflictException({
          message: `Insufficient stock available. Required: ${opts.quantity}, Available: ${available}`,
          errorCode: INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
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

  /**
   * Atomic Stock Reservation (e.g. Order checkout placement)
   */
  async reserveStock(opts: StockOperationOptions) {
    if (opts.quantity <= 0) {
      throw new BadRequestException({
        message: 'Reservation quantity must be greater than 0',
        errorCode: INVENTORY_ERROR_CODES.INVALID_RESERVATION,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { variantId: opts.variantId },
      });

      if (!inventory) {
        throw new NotFoundException({
          message: `Inventory for variant '${opts.variantId}' not found`,
          errorCode: INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
        });
      }

      const available = inventory.stock - inventory.reservedStock;
      if (available < opts.quantity) {
        throw new ConflictException({
          message: `Insufficient stock available for reservation. Required: ${opts.quantity}, Available: ${available}`,
          errorCode: INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
        });
      }

      const updated = await tx.inventory.update({
        where: { id: inventory.id },
        data: { reservedStock: { increment: opts.quantity } },
      });

      await tx.stockHistory.create({
        data: {
          inventoryId: inventory.id,
          type: StockAdjustmentType.RESERVATION,
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

  /**
   * Atomic Reservation Release (e.g. Cancelled cart / checkout timeout)
   */
  async releaseStock(opts: StockOperationOptions) {
    if (opts.quantity <= 0) {
      throw new BadRequestException({
        message: 'Release quantity must be greater than 0',
        errorCode: INVENTORY_ERROR_CODES.INVALID_RELEASE,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { variantId: opts.variantId },
      });

      if (!inventory) {
        throw new NotFoundException({
          message: `Inventory for variant '${opts.variantId}' not found`,
          errorCode: INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
        });
      }

      if (inventory.reservedStock < opts.quantity) {
        throw new BadRequestException({
          message: `Cannot release more stock than currently reserved. Reserved: ${inventory.reservedStock}, Requested: ${opts.quantity}`,
          errorCode: INVENTORY_ERROR_CODES.INVALID_RELEASE,
        });
      }

      const updated = await tx.inventory.update({
        where: { id: inventory.id },
        data: { reservedStock: { decrement: opts.quantity } },
      });

      await tx.stockHistory.create({
        data: {
          inventoryId: inventory.id,
          type: StockAdjustmentType.RELEASE,
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

  /**
   * Bulk Adjustment Transaction (All items in one transaction or complete rollback)
   */
  async bulkAdjust(items: StockOperationOptions[], createdBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });

        if (!inventory) {
          throw new NotFoundException({
            message: `Inventory for variant '${item.variantId}' not found during bulk processing`,
            errorCode: INVENTORY_ERROR_CODES.INVENTORY_NOT_FOUND,
          });
        }

        const previousStock = inventory.stock;
        const newStock = previousStock + item.quantity;

        if (newStock < 0) {
          throw new ConflictException({
            message: `Bulk adjustment resulting in negative stock for variant '${item.variantId}'`,
            errorCode: INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
          });
        }

        const updated = await tx.inventory.update({
          where: { id: inventory.id },
          data: { stock: newStock },
        });

        await tx.stockHistory.create({
          data: {
            inventoryId: inventory.id,
            type: item.quantity >= 0 ? StockAdjustmentType.STOCK_IN : StockAdjustmentType.STOCK_OUT,
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
}
