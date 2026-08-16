"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderNumberUtil = void 0;
class OrderNumberUtil {
    static generateOrderNumber(sequenceNumber) {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const seq = String(sequenceNumber).padStart(4, '0');
        return `UV-${year}${month}${day}-${seq}`;
    }
}
exports.OrderNumberUtil = OrderNumberUtil;
//# sourceMappingURL=order-number.util.js.map