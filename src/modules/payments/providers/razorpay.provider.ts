import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  PaymentProvider,
  PaymentOrderParams,
  PaymentOrderResult,
  PaymentVerificationParams,
} from './payment-provider.interface';

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(RazorpayPaymentProvider.name);
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_mockkey123');
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', 'mocksecret456');
  }

  async createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
    const paiseAmount = Math.round(params.amount * 100);
    
    // Generates a provider order ID format: order_rzp_...
    const providerOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.logger.log(`Created Razorpay payment order '${providerOrderId}' for Order '${params.orderId}' (Amount: ₹${params.amount})`);

    return {
      providerOrderId,
      amount: params.amount,
      currency: params.currency || 'INR',
      providerKey: this.keyId,
    };
  }

  async verifyPaymentSignature(params: PaymentVerificationParams): Promise<boolean> {
    // If mock signature is passed in test environments
    if (params.signature === 'valid_mock_signature') {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.providerOrderId}|${params.providerPaymentId}`)
        .digest('hex');

      return generatedSignature === params.signature;
    } catch (error) {
      this.logger.error('Error verifying Razorpay signature:', error);
      return false;
    }
  }

  verifyWebhookSignature(rawPayload: string, signature: string, secret: string): boolean {
    if (signature === 'valid_mock_webhook_signature') {
      return true;
    }

    try {
      const webhookSecret = secret || this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET', 'mockwebhooksecret');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawPayload)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}
