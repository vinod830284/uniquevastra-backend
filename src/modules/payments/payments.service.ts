import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PaymentsRepository } from './repositories/payments.repository';
import type { PaymentProvider } from './providers/payment-provider.interface';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { OrderStatus, PaymentStatus, PaymentProviderType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private repository: PaymentsRepository,
    @Inject('PAYMENT_PROVIDER') private readonly paymentProvider: any,
    private prisma: PrismaService,
  ) {}

  async createPayment(userId: string, orderId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to pay for this order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('This order has already been paid');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot initiate payment for a cancelled order');
    }

    const amount = Number(order.total);

    // Call Provider Abstraction
    const providerResult = await (this.paymentProvider as PaymentProvider).createPaymentOrder({
      orderId: order.id,
      amount,
      currency: 'INR',
      metadata: { orderNumber: order.orderNumber, userId },
    });

    // Create local Payment record
    const payment = await this.repository.createPayment({
      order: { connect: { id: order.id } },
      provider: PaymentProviderType.RAZORPAY,
      method: dto.method,
      amount,
      currency: providerResult.currency,
      providerOrderId: providerResult.providerOrderId,
      status: PaymentStatus.CREATED,
    });

    await this.repository.createEvent(payment.id, 'payment.created', undefined, {
      providerOrderId: providerResult.providerOrderId,
    });

    return {
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: providerResult.amount,
      currency: providerResult.currency,
      providerOrderId: providerResult.providerOrderId,
      providerKey: providerResult.providerKey,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    const payment = await this.repository.findById(dto.paymentId);
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (payment.order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to verify this payment');
    }

    if (payment.status === PaymentStatus.PAID) {
      return { success: true, message: 'Payment already verified', payment };
    }

    // Verify HMAC Signature via Provider Abstraction
    const isValid = await (this.paymentProvider as PaymentProvider).verifyPaymentSignature({
      providerPaymentId: dto.providerPaymentId,
      providerOrderId: dto.providerOrderId,
      signature: dto.signature,
    });

    if (!isValid) {
      await this.repository.updatePaymentStatus(
        payment.id,
        PaymentStatus.FAILED,
        dto.providerPaymentId,
        'Invalid signature verification failure',
      );
      await this.repository.createEvent(payment.id, 'payment.failed', undefined, {
        reason: 'Signature mismatch',
      });
      throw new BadRequestException('Payment signature verification failed');
    }

    // Process Payment Success Transactionally
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Payment Status to PAID
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerPaymentId: dto.providerPaymentId,
        },
      });

      // 2. Update Order to PAID and CONFIRMED
      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
        },
      });

      // 3. Log Order Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: orderStatusToEnum(payment.order.status),
          toStatus: OrderStatus.CONFIRMED,
          changedBy: userId,
          reason: `Payment verified successfully (${dto.providerPaymentId})`,
        },
      });

      // 4. Record Payment Event
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'payment.authorized_and_paid',
          metadata: { providerPaymentId: dto.providerPaymentId, signature: dto.signature },
        },
      });

      return {
        success: true,
        message: 'Payment verified and order confirmed successfully',
        payment: updatedPayment,
        order: updatedOrder,
      };
    });
  }

  async handleWebhook(rawBody: string, signature: string, payload: any) {
    // 1. Verify Webhook Signature
    const isValid = (this.paymentProvider as PaymentProvider).verifyWebhookSignature(rawBody, signature, '');
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const providerOrderId = paymentEntity?.order_id;
    const providerPaymentId = paymentEntity?.id;
    const eventId = payload?.event_id || `${event}_${providerPaymentId}_${Date.now()}`;

    if (!providerOrderId) {
      return { status: 'ignored', reason: 'No provider order ID in payload' };
    }

    const localPayment = await this.repository.findByProviderOrderId(providerOrderId);
    if (!localPayment) {
      return { status: 'ignored', reason: 'Order payment not found' };
    }

    // 2. Deduplication check
    const existingEvent = await this.prisma.paymentEvent.findUnique({
      where: { providerEventId: eventId },
    });

    if (existingEvent) {
      return { status: 'ignored', reason: 'Webhook event already processed' };
    }

    // 3. Process Webhook Event
    if (event === 'payment.captured' || event === 'order.paid') {
      if (localPayment.status !== PaymentStatus.PAID) {
        await this.prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: localPayment.id },
            data: { status: PaymentStatus.PAID, providerPaymentId },
          });

          await tx.order.update({
            where: { id: localPayment.orderId },
            data: { paymentStatus: PaymentStatus.PAID, status: OrderStatus.CONFIRMED },
          });

          await tx.paymentEvent.create({
            data: {
              paymentId: localPayment.id,
              eventType: event,
              providerEventId: eventId,
              metadata: payload,
            },
          });
        });
      }
    } else if (event === 'payment.failed') {
      await this.repository.updatePaymentStatus(
        localPayment.id,
        PaymentStatus.FAILED,
        providerPaymentId,
        paymentEntity?.error_description || 'Payment failed via webhook notification',
      );
      await this.repository.createEvent(localPayment.id, event, eventId, payload);
    }

    return { status: 'processed', eventId };
  }

  async getOrderPayments(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');
    return this.repository.findOrderPayments(orderId);
  }

  async findAllAdmin(query: PaymentQueryDto) {
    return this.repository.findAllAdmin(query);
  }

  async findByIdAdmin(id: string) {
    const payment = await this.repository.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}

function orderStatusToEnum(status: string): OrderStatus {
  return status as OrderStatus;
}
