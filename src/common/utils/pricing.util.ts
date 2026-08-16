import { BadRequestException } from '@nestjs/common';

export interface PriceValidationInput {
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
}

export class PricingUtil {
  static validatePricing({ price, compareAtPrice, costPrice }: PriceValidationInput): void {
    if (price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice < 0) {
      throw new BadRequestException('Compare-at price cannot be negative');
    }

    if (costPrice !== undefined && costPrice !== null && costPrice < 0) {
      throw new BadRequestException('Cost price cannot be negative');
    }

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice > 0 &&
      compareAtPrice < price
    ) {
      throw new BadRequestException('Compare-at price should be greater than or equal to selling price');
    }
  }

  static calculateDiscountPercentage(price: number, compareAtPrice?: number): number {
    if (!compareAtPrice || compareAtPrice <= price) {
      return 0;
    }
    const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
    return Math.round(discount);
  }
}
