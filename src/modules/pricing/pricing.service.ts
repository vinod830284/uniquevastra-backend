import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CalculatedLineItem {
  id?: string;
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;       // Rupees (display)
  unitPricePaise: number;  // Integer Paise
  compareAtPrice?: number | null;
  compareAtPricePaise?: number | null;
  lineTotal: number;       // Rupees
  lineTotalPaise: number;  // Integer Paise
  available: boolean;
  unavailabilityReason?: string;
}

export interface CalculatedPricingResult {
  items: CalculatedLineItem[];
  subtotal: number;            // Rupees
  subtotalPaise: number;       // Integer Paise
  discount: number;            // Total compare-at savings
  discountPaise: number;
  deliveryFee: number;         // Rupees
  deliveryFeePaise: number;
  freeDeliveryThreshold: number; // Rupees
  total: number;               // Rupees
  totalPaise: number;          // Integer Paise
  hasUnavailableItems: boolean;
}

@Injectable()
export class PricingService {
  private readonly freeDeliveryThreshold: number;
  private readonly defaultDeliveryFee: number;

  constructor(private configService: ConfigService) {
    this.freeDeliveryThreshold = this.configService.get<number>('FREE_DELIVERY_THRESHOLD', 999);
    this.defaultDeliveryFee = this.configService.get<number>('DELIVERY_FEE', 99);
  }

  /**
   * Convert Rupees to integer Paise to prevent JS floating-point inaccuracies
   */
  static rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }

  /**
   * Convert integer Paise back to Rupees
   */
  static paiseToRupees(paise: number): number {
    return Number((paise / 100).toFixed(2));
  }

  /**
   * Authoritative calculation for cart items
   */
  calculateCartPricing(cartItems: any[]): CalculatedPricingResult {
    let subtotalPaise = 0;
    let totalDiscountPaise = 0;
    let hasUnavailableItems = false;

    const calculatedItems: CalculatedLineItem[] = cartItems.map((item) => {
      const variant = item.variant;
      const product = variant?.product;

      let available = true;
      let unavailabilityReason: string | undefined = undefined;

      if (!product || product.status !== 'ACTIVE') {
        available = false;
        unavailabilityReason = 'PRODUCT_UNAVAILABLE';
      } else if (!variant || variant.status !== 'ACTIVE') {
        available = false;
        unavailabilityReason = 'VARIANT_UNAVAILABLE';
      } else if (variant.inventory) {
        const availStock = Math.max(0, variant.inventory.stock - variant.inventory.reservedStock);
        if (availStock < item.quantity) {
          available = false;
          unavailabilityReason = `INSUFFICIENT_STOCK (${availStock} available)`;
        }
      }

      if (!available) {
        hasUnavailableItems = true;
      }

      const unitPrice = variant ? Number(variant.price) : 0;
      const unitPricePaise = PricingService.rupeesToPaise(unitPrice);
      const quantity = item.quantity;
      const lineTotalPaise = unitPricePaise * quantity;
      const lineTotal = PricingService.paiseToRupees(lineTotalPaise);

      if (available) {
        subtotalPaise += lineTotalPaise;
      }

      const compareAtPrice = variant?.compareAtPrice ? Number(variant.compareAtPrice) : null;
      const compareAtPricePaise = compareAtPrice ? PricingService.rupeesToPaise(compareAtPrice) : null;
      if (compareAtPricePaise && compareAtPricePaise > unitPricePaise && available) {
        totalDiscountPaise += (compareAtPricePaise - unitPricePaise) * quantity;
      }

      const primaryImg = variant?.images?.[0]?.url || product?.images?.[0]?.url;

      return {
        id: item.id,
        variantId: variant?.id || item.variantId,
        productId: product?.id || '',
        productName: product?.name || 'Unknown Product',
        sku: variant?.sku || '',
        size: variant?.size || '',
        color: variant?.color || '',
        imageUrl: primaryImg,
        quantity,
        unitPrice,
        unitPricePaise,
        compareAtPrice,
        compareAtPricePaise,
        lineTotal,
        lineTotalPaise,
        available,
        unavailabilityReason,
      };
    });

    const subtotal = PricingService.paiseToRupees(subtotalPaise);
    const discount = PricingService.paiseToRupees(totalDiscountPaise);

    // Calculate delivery fee based on free delivery threshold rule
    let deliveryFeePaise = 0;
    if (subtotal < this.freeDeliveryThreshold && subtotal > 0) {
      deliveryFeePaise = PricingService.rupeesToPaise(this.defaultDeliveryFee);
    }
    const deliveryFee = PricingService.paiseToRupees(deliveryFeePaise);

    const grandTotalPaise = subtotalPaise + deliveryFeePaise;
    const total = PricingService.paiseToRupees(grandTotalPaise);

    return {
      items: calculatedItems,
      subtotal,
      subtotalPaise,
      discount,
      discountPaise: totalDiscountPaise,
      deliveryFee,
      deliveryFeePaise,
      freeDeliveryThreshold: this.freeDeliveryThreshold,
      total,
      totalPaise: grandTotalPaise,
      hasUnavailableItems,
    };
  }
}
