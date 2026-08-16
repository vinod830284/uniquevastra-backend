import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { CouponsRepository } from './repositories/coupons.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponStatus, CouponType } from '@prisma/client';

describe('CouponsService (Validation & Discount Calculation Tests)', () => {
  let service: CouponsService;

  const mockRepository = {
    findByCode: jest.fn(),
    countTotalUsages: jest.fn(),
    countUserUsages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: CouponsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    jest.clearAllMocks();
  });

  it('Should throw NotFoundException if coupon code does not exist', async () => {
    mockRepository.findByCode.mockResolvedValue(null);

    await expect(
      service.validateCoupon('INVALID10', 'user-1', 1000),
    ).rejects.toThrow(NotFoundException);
  });

  it('Should throw BadRequestException if coupon is expired', async () => {
    mockRepository.findByCode.mockResolvedValue({
      code: 'EXPIRED10',
      status: CouponStatus.ACTIVE,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'), // Past date
      minimumOrderValue: 0,
    });

    await expect(
      service.validateCoupon('EXPIRED10', 'user-1', 1000),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should calculate PERCENTAGE discount capped at maximumDiscount', async () => {
    mockRepository.findByCode.mockResolvedValue({
      code: 'MAXCAP20',
      type: CouponType.PERCENTAGE,
      value: 20, // 20% of 2000 = 400
      maximumDiscount: 150, // Capped at 150
      status: CouponStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2028-12-31'),
      minimumOrderValue: 500,
    });
    mockRepository.countTotalUsages.mockResolvedValue(0);
    mockRepository.countUserUsages.mockResolvedValue(0);

    const result = await service.validateCoupon('MAXCAP20', 'user-1', 2000);
    expect(result.discountAmount).toBe(150);
  });

  it('Should calculate FIXED discount without allowing negative total', async () => {
    mockRepository.findByCode.mockResolvedValue({
      code: 'FLAT500',
      type: CouponType.FIXED,
      value: 500, // ₹500 off
      status: CouponStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2028-12-31'),
      minimumOrderValue: 0,
    });
    mockRepository.countTotalUsages.mockResolvedValue(0);
    mockRepository.countUserUsages.mockResolvedValue(0);

    const result = await service.validateCoupon('FLAT500', 'user-1', 200); // Subtotal = 200
    expect(result.discountAmount).toBe(200); // Capped at subtotal
  });
});
