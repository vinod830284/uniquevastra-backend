import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentOrderParams, PaymentOrderResult, PaymentVerificationParams } from './payment-provider.interface';
export declare class RazorpayPaymentProvider implements PaymentProvider {
    private configService;
    private readonly logger;
    private readonly keyId;
    private readonly keySecret;
    constructor(configService: ConfigService);
    createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
    verifyPaymentSignature(params: PaymentVerificationParams): Promise<boolean>;
    verifyWebhookSignature(rawPayload: string, signature: string, secret: string): boolean;
}
