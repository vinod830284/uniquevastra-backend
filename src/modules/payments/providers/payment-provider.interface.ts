export interface PaymentOrderParams {
  orderId: string;
  amount: number; // Amount in Rupees
  currency: string;
  metadata?: any;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  providerKey: string;
}

export interface PaymentVerificationParams {
  providerPaymentId: string;
  providerOrderId: string;
  signature: string;
}

export interface PaymentProvider {
  createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(params: PaymentVerificationParams): Promise<boolean>;
  verifyWebhookSignature(rawPayload: string, signature: string, secret: string): boolean;
}
