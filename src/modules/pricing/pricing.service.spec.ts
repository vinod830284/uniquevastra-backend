import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { ConfigService } from '@nestjs/config';

describe('PricingService (Financial & Delivery Calculation Tests)', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback: any) => {
              if (key === 'FREE_DELIVERY_THRESHOLD') return 999;
              if (key === 'DELIVERY_FEE') return 99;
              return fallback;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('Should convert Rupees to Paise accurately without floating point errors', () => {
    expect(PricingService.rupeesToPaise(899.99)).toBe(89999);
    expect(PricingService.paiseToRupees(89999)).toBe(899.99);
  });

  it('Should apply delivery fee if subtotal is below free delivery threshold (₹999)', () => {
    const mockItems = [
      {
        quantity: 1,
        variant: {
          id: 'v1',
          price: 899,
          compareAtPrice: 1299,
          status: 'ACTIVE',
          product: { id: 'p1', name: 'Tee', status: 'ACTIVE' },
        },
      },
    ];

    const result = service.calculateCartPricing(mockItems);

    expect(result.subtotal).toBe(899);
    expect(result.discount).toBe(400); // 1299 - 899
    expect(result.deliveryFee).toBe(99);
    expect(result.total).toBe(998); // 899 + 99
  });

  it('Should waive delivery fee if subtotal is greater than or equal to threshold (₹999)', () => {
    const mockItems = [
      {
        quantity: 2,
        variant: {
          id: 'v1',
          price: 899, // 899 * 2 = 1798 >= 999
          status: 'ACTIVE',
          product: { id: 'p1', name: 'Tee', status: 'ACTIVE' },
        },
      },
    ];

    const result = service.calculateCartPricing(mockItems);

    expect(result.subtotal).toBe(1798);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(1798);
  });
});
