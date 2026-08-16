import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { RazorpayPaymentProvider } from './providers/razorpay.provider';
import { PublicPaymentsController, AdminPaymentsController } from './payments.controller';

@Module({
  controllers: [PublicPaymentsController, AdminPaymentsController],
  providers: [
    PaymentsService,
    PaymentsRepository,
    RazorpayPaymentProvider,
    {
      provide: 'PAYMENT_PROVIDER',
      useClass: RazorpayPaymentProvider,
    },
  ],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
