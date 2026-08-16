import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { PricingService } from '../pricing/pricing.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('CartService (Unit Tests)', () => {
  let service: CartService;

  const mockCartRepository = {
    findOrCreateCart: jest.fn(),
    findCartItem: jest.fn(),
    findCartItemById: jest.fn(),
    upsertCartItem: jest.fn(),
    updateItemQuantity: jest.fn(),
    deleteItem: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockPrismaService = {
    productVariant: {
      findUnique: jest.fn(),
    },
  };

  const mockPricingService = {
    calculateCartPricing: jest.fn((items) => ({
      items: items.map((i: any) => ({
        variantId: i.variantId || i.variant?.id,
        quantity: i.quantity,
        unitPrice: 899,
        lineTotal: 899 * i.quantity,
        available: true,
      })),
      subtotal: 899,
      discount: 0,
      deliveryFee: 99,
      freeDeliveryThreshold: 999,
      total: 998,
      hasUnavailableItems: false,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: PricingService, useValue: mockPricingService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  it('Should throw ConflictException if adding quantity greater than available stock', async () => {
    mockPrismaService.productVariant.findUnique.mockResolvedValue({
      id: 'v1',
      status: 'ACTIVE',
      product: { status: 'ACTIVE' },
      inventory: { stock: 2, reservedStock: 0 }, // Available = 2
    });

    mockCartRepository.findOrCreateCart.mockResolvedValue({ id: 'cart-1', items: [] });
    mockCartRepository.findCartItem.mockResolvedValue(null);

    await expect(
      service.addItem('user-1', { variantId: 'v1', quantity: 5 }),
    ).rejects.toThrow(ConflictException);
  });

  it('Should get active cart with calculated line items and totals', async () => {
    mockCartRepository.findOrCreateCart.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          variantId: 'v1',
          quantity: 1,
          variant: { id: 'v1', price: 899, status: 'ACTIVE', product: { status: 'ACTIVE' } },
        },
      ],
    });

    const cart = await service.getCart('user-1');

    expect(cart.userId).toBe('user-1');
    expect(cart.subtotal).toBe(899);
    expect(cart.total).toBe(998);
  });
});
