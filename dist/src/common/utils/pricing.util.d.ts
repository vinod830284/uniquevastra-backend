export interface PriceValidationInput {
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
}
export declare class PricingUtil {
    static validatePricing({ price, compareAtPrice, costPrice }: PriceValidationInput): void;
    static calculateDiscountPercentage(price: number, compareAtPrice?: number): number;
}
