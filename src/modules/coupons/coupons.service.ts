import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CouponsRepository } from './repositories/coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponStatus, CouponType } from '@prisma/client';

export interface ValidatedCouponResult {
  coupon: any;
  discountAmount: number;
  freeDelivery: boolean;
}

@Injectable()
export class CouponsService {
  constructor(private repository: CouponsRepository) {}

  async validateCoupon(code: string, userId: string, subtotal: number, deliveryFee = 0): Promise<ValidatedCouponResult> {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await this.repository.findByCode(normalizedCode);

    if (!coupon) {
      throw new NotFoundException(`Coupon code '${normalizedCode}' does not exist`);
    }

    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException(`Coupon '${normalizedCode}' is currently inactive or disabled`);
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException(`Coupon '${normalizedCode}' is not active yet`);
    }
    if (now > coupon.endDate) {
      throw new BadRequestException(`Coupon '${normalizedCode}' has expired`);
    }

    const minOrder = Number(coupon.minimumOrderValue || 0);
    if (subtotal < minOrder) {
      throw new BadRequestException(
        `Minimum order value of ₹${minOrder} required to apply coupon '${normalizedCode}'`,
      );
    }

    if (coupon.usageLimit) {
      const totalUsages = await this.repository.countTotalUsages(coupon.id);
      if (totalUsages >= coupon.usageLimit) {
        throw new BadRequestException(`Coupon '${normalizedCode}' global usage limit has been reached`);
      }
    }

    if (coupon.perUserLimit) {
      const userUsages = await this.repository.countUserUsages(coupon.id, userId);
      if (userUsages >= coupon.perUserLimit) {
        throw new BadRequestException(`You have reached the redemption limit for coupon '${normalizedCode}'`);
      }
    }

    // Calculate discount amount based on type
    let discountAmount = 0;
    let freeDelivery = false;
    const value = Number(coupon.value);

    if (coupon.type === CouponType.PERCENTAGE) {
      let rawDiscount = (subtotal * value) / 100;
      if (coupon.maximumDiscount) {
        rawDiscount = Math.min(rawDiscount, Number(coupon.maximumDiscount));
      }
      discountAmount = Math.min(rawDiscount, subtotal);
    } else if (coupon.type === CouponType.FIXED) {
      discountAmount = Math.min(value, subtotal);
    } else if (coupon.type === CouponType.FREE_DELIVERY) {
      discountAmount = deliveryFee;
      freeDelivery = true;
    }

    return {
      coupon,
      discountAmount: Number(discountAmount.toFixed(2)),
      freeDelivery,
    };
  }

  async createCoupon(dto: CreateCouponDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existing = await this.repository.findByCode(normalizedCode);
    if (existing) {
      throw new ConflictException(`Coupon code '${normalizedCode}' already exists`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    if (dto.type === CouponType.PERCENTAGE && dto.value > 100) {
      throw new BadRequestException('Percentage coupon value cannot exceed 100%');
    }

    return this.repository.create({
      code: normalizedCode,
      type: dto.type,
      value: dto.value,
      minimumOrderValue: dto.minimumOrderValue || 0,
      maximumDiscount: dto.maximumDiscount || null,
      startDate,
      endDate,
      usageLimit: dto.usageLimit || null,
      perUserLimit: dto.perUserLimit || 1,
      status: CouponStatus.ACTIVE,
    });
  }

  async findAllAdmin(page = 1, limit = 20) {
    return this.repository.findAllAdmin(page, limit);
  }

  async findByIdAdmin(id: string) {
    const coupon = await this.repository.findById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }
    return coupon;
  }

  async disableCoupon(id: string) {
    return this.repository.setStatus(id, CouponStatus.DISABLED);
  }

  async enableCoupon(id: string) {
    return this.repository.setStatus(id, CouponStatus.ACTIVE);
  }

  async getUsages(id: string) {
    return this.repository.getUsages(id);
  }
}
