"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PricingService = PricingService_1 = class PricingService {
    configService;
    freeDeliveryThreshold;
    defaultDeliveryFee;
    constructor(configService) {
        this.configService = configService;
        this.freeDeliveryThreshold = this.configService.get('FREE_DELIVERY_THRESHOLD', 999);
        this.defaultDeliveryFee = this.configService.get('DELIVERY_FEE', 99);
    }
    static rupeesToPaise(rupees) {
        return Math.round(rupees * 100);
    }
    static paiseToRupees(paise) {
        return Number((paise / 100).toFixed(2));
    }
    calculateCartPricing(cartItems) {
        let subtotalPaise = 0;
        let totalDiscountPaise = 0;
        let hasUnavailableItems = false;
        const calculatedItems = cartItems.map((item) => {
            const variant = item.variant;
            const product = variant?.product;
            let available = true;
            let unavailabilityReason = undefined;
            if (!product || product.status !== 'ACTIVE') {
                available = false;
                unavailabilityReason = 'PRODUCT_UNAVAILABLE';
            }
            else if (!variant || variant.status !== 'ACTIVE') {
                available = false;
                unavailabilityReason = 'VARIANT_UNAVAILABLE';
            }
            else if (variant.inventory) {
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
            const unitPricePaise = PricingService_1.rupeesToPaise(unitPrice);
            const quantity = item.quantity;
            const lineTotalPaise = unitPricePaise * quantity;
            const lineTotal = PricingService_1.paiseToRupees(lineTotalPaise);
            if (available) {
                subtotalPaise += lineTotalPaise;
            }
            const compareAtPrice = variant?.compareAtPrice ? Number(variant.compareAtPrice) : null;
            const compareAtPricePaise = compareAtPrice ? PricingService_1.rupeesToPaise(compareAtPrice) : null;
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
        const subtotal = PricingService_1.paiseToRupees(subtotalPaise);
        const discount = PricingService_1.paiseToRupees(totalDiscountPaise);
        let deliveryFeePaise = 0;
        if (subtotal < this.freeDeliveryThreshold && subtotal > 0) {
            deliveryFeePaise = PricingService_1.rupeesToPaise(this.defaultDeliveryFee);
        }
        const deliveryFee = PricingService_1.paiseToRupees(deliveryFeePaise);
        const grandTotalPaise = subtotalPaise + deliveryFeePaise;
        const total = PricingService_1.paiseToRupees(grandTotalPaise);
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
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = PricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map