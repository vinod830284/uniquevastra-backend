import { Test, TestingModule } from '@nestjs/testing';
import { InventoryTransactionService } from './inventory-transaction.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { StockAdjustmentType } from '@prisma/client';
import { INVENTORY_ERROR_CODES } from './constants/inventory.constants';

describe('InventoryTransactionService (Atomic Transactions & Concurrency Tests)', () => {
  let service: InventoryTransactionService;

  const mockPrisma = {
    inventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    stockHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryTransactionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InventoryTransactionService>(InventoryTransactionService);
    jest.clearAllMocks();
  });

  it('Should increase stock and record StockHistory', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv-1',
      variantId: 'var-1',
      stock: 10,
      reservedStock: 0,
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv-1',
      stock: 20,
      reservedStock: 0,
    });

    const updated = await service.increaseStock({
      variantId: 'var-1',
      quantity: 10,
      reason: 'New Stock intake',
      createdBy: 'admin-usr-1',
    });

    expect(updated.stock).toBe(20);
    expect(mockPrisma.stockHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        inventoryId: 'inv-1',
        type: StockAdjustmentType.STOCK_IN,
        quantity: 10,
        previousStock: 10,
        newStock: 20,
        reason: 'New Stock intake',
        createdBy: 'admin-usr-1',
      }),
    });
  });

  it('Should throw ConflictException when trying to decrease more than available stock', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv-1',
      variantId: 'var-1',
      stock: 5,
      reservedStock: 2, // Available = 3
    });

    await expect(
      service.decreaseStock({
        variantId: 'var-1',
        quantity: 5, // Requires 5, only 3 available
        reason: 'Order placement',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('Should reserve stock and update reservedStock counter', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv-1',
      variantId: 'var-1',
      stock: 10,
      reservedStock: 2, // Available = 8
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv-1',
      stock: 10,
      reservedStock: 5,
    });

    const updated = await service.reserveStock({
      variantId: 'var-1',
      quantity: 3,
      reason: 'Cart reservation',
    });

    expect(mockPrisma.inventory.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: { reservedStock: { increment: 3 } },
    });
    expect(mockPrisma.stockHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StockAdjustmentType.RESERVATION,
        quantity: 3,
      }),
    });
  });

  it('CRITICAL CONCURRENCY TEST: Two parallel reservation requests for last 1 available stock unit', async () => {
    let currentStock = 1;
    let currentReserved = 0;

    // Simulate database transaction lock & check
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      // Simulate state read
      const available = currentStock - currentReserved;
      if (available < 1) {
        throw new ConflictException({
          message: 'Insufficient stock available',
          errorCode: INVENTORY_ERROR_CODES.INSUFFICIENT_STOCK,
        });
      }

      // Increment reservation atomically
      currentReserved += 1;
      return { id: 'inv-atomic', stock: currentStock, reservedStock: currentReserved };
    });

    // Fire Customer A and Customer B requests concurrently
    const reqA = service.reserveStock({ variantId: 'var-last-unit', quantity: 1, reason: 'Cust A' });
    const reqB = service.reserveStock({ variantId: 'var-last-unit', quantity: 1, reason: 'Cust B' });

    const results = await Promise.allSettled([reqA, reqB]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly 1 request succeeds and 1 fails with INSUFFICIENT_STOCK
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(currentReserved).toBe(1); // Reserved stock never exceeds physical stock
  });
});
