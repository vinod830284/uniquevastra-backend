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
    unitPrice: number;
    unitPricePaise: number;
    compareAtPrice?: number | null;
    compareAtPricePaise?: number | null;
    lineTotal: number;
    lineTotalPaise: number;
    available: boolean;
    unavailabilityReason?: string;
}
export interface CalculatedPricingResult {
    items: CalculatedLineItem[];
    subtotal: number;
    subtotalPaise: number;
    discount: number;
    discountPaise: number;
    deliveryFee: number;
    deliveryFeePaise: number;
    freeDeliveryThreshold: number;
    total: number;
    totalPaise: number;
    hasUnavailableItems: boolean;
}
export declare class PricingService {
    private configService;
    private readonly freeDeliveryThreshold;
    private readonly defaultDeliveryFee;
    constructor(configService: ConfigService);
    static rupeesToPaise(rupees: number): number;
    static paiseToRupees(paise: number): number;
    calculateCartPricing(cartItems: any[]): CalculatedPricingResult;
}
