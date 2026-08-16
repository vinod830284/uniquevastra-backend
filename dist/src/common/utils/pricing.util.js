"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingUtil = void 0;
const common_1 = require("@nestjs/common");
class PricingUtil {
    static validatePricing({ price, compareAtPrice, costPrice }) {
        if (price < 0) {
            throw new common_1.BadRequestException('Price cannot be negative');
        }
        if (compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice < 0) {
            throw new common_1.BadRequestException('Compare-at price cannot be negative');
        }
        if (costPrice !== undefined && costPrice !== null && costPrice < 0) {
            throw new common_1.BadRequestException('Cost price cannot be negative');
        }
        if (compareAtPrice !== undefined &&
            compareAtPrice !== null &&
            compareAtPrice > 0 &&
            compareAtPrice < price) {
            throw new common_1.BadRequestException('Compare-at price should be greater than or equal to selling price');
        }
    }
    static calculateDiscountPercentage(price, compareAtPrice) {
        if (!compareAtPrice || compareAtPrice <= price) {
            return 0;
        }
        const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
        return Math.round(discount);
    }
}
exports.PricingUtil = PricingUtil;
//# sourceMappingURL=pricing.util.js.map