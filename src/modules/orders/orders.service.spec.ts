import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { PricingService } from '../pricing/pricing.service';
import { InventoryTransactionService } from '../inventory/inventory-transaction.service';
import { CouponsService } from '../coupons/coupons.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';

describe('OrdersService (Checkout, Idempotency & Transition Tests)', () => {
  let service: OrdersService;

  const mockRepository = {
    findById: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findUserOrders: jest.fn(),
    findAllAdmin: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockPricingService = {
    calculateCartPricing: jest.fn(),
  };

  const mockInventoryTransactionService = {
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
  };

  const mockCouponsService = {
    validateCoupon: jest.fn(),
  };

  const mockPrismaService = {
    cart: { findUnique: jest.fn(), update: jest.fn() },
    address: { findUnique: jest.fn() },
    order: { count: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    orderItem: { createMany: jest.fn() },
    orderAddress: { create: jest.fn() },
    orderStatusHistory: { create: jest.fn() },
    couponUsage: { create: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockRepository },
        { provide: PricingService, useValue: mockPricingService },
        { provide: InventoryTransactionService, useValue: mockInventoryTransactionService },
        { provide: CouponsService, useValue: mockCouponsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('Should return existing order when Idempotency-Key is reused', async () => {
    const existingOrder = { id: 'ord-123', orderNumber: 'UV-20260815-0001', idempotencyKey: 'key-abc' };
    mockRepository.findByIdempotencyKey.mockResolvedValue(existingOrder);

    const result = await service.createOrder('user-1', { addressId: 'addr-1', paymentMethod: PaymentMethod.COD }, 'key-abc');

    expect(result).toBe(existingOrder);
    expect(mockPrismaService.cart.findUnique).not.toHaveBeenCalled();
  });

  it('Should reject invalid order status transitions (e.g. DELIVERED -> PENDING)', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'ord-1',
      status: OrderStatus.DELIVERED,
      items: [],
    });

    await expect(
      service.updateStatusAdmin('ord-1', { status: OrderStatus.PENDING }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should release inventory when order is cancelled', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'ord-1',
      userId: 'user-1',
      status: OrderStatus.PENDING,
      items: [{ variantId: 'v1', quantity: 2 }],
    });
    mockRepository.updateStatus.mockResolvedValue({ id: 'ord-1', status: OrderStatus.CANCELLED });

    await service.cancelOrder('user-1', 'ord-1', 'Changed mind');

    expect(mockInventoryTransactionService.releaseStock).toHaveBeenCalledWith({
      variantId: 'v1',
      quantity: 2,
      reason: 'Changed mind',
      createdBy: 'user-1',
      referenceType: 'ORDER_CANCEL',
      referenceId: 'ord-1',
    });
  });
});
