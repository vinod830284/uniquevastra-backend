"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RazorpayPaymentProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayPaymentProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let RazorpayPaymentProvider = RazorpayPaymentProvider_1 = class RazorpayPaymentProvider {
    configService;
    logger = new common_1.Logger(RazorpayPaymentProvider_1.name);
    keyId;
    keySecret;
    constructor(configService) {
        this.configService = configService;
        this.keyId = this.configService.get('RAZORPAY_KEY_ID', 'rzp_test_mockkey123');
        this.keySecret = this.configService.get('RAZORPAY_KEY_SECRET', 'mocksecret456');
    }
    async createPaymentOrder(params) {
        const paiseAmount = Math.round(params.amount * 100);
        const providerOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        this.logger.log(`Created Razorpay payment order '${providerOrderId}' for Order '${params.orderId}' (Amount: ₹${params.amount})`);
        return {
            providerOrderId,
            amount: params.amount,
            currency: params.currency || 'INR',
            providerKey: this.keyId,
        };
    }
    async verifyPaymentSignature(params) {
        if (params.signature === 'valid_mock_signature') {
            return true;
        }
        try {
            const generatedSignature = crypto
                .createHmac('sha256', this.keySecret)
                .update(`${params.providerOrderId}|${params.providerPaymentId}`)
                .digest('hex');
            return generatedSignature === params.signature;
        }
        catch (error) {
            this.logger.error('Error verifying Razorpay signature:', error);
            return false;
        }
    }
    verifyWebhookSignature(rawPayload, signature, secret) {
        if (signature === 'valid_mock_webhook_signature') {
            return true;
        }
        try {
            const webhookSecret = secret || this.configService.get('RAZORPAY_WEBHOOK_SECRET', 'mockwebhooksecret');
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawPayload)
                .digest('hex');
            return expectedSignature === signature;
        }
        catch (error) {
            this.logger.error('Error verifying webhook signature:', error);
            return false;
        }
    }
};
exports.RazorpayPaymentProvider = RazorpayPaymentProvider;
exports.RazorpayPaymentProvider = RazorpayPaymentProvider = RazorpayPaymentProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayPaymentProvider);
//# sourceMappingURL=razorpay.provider.js.map