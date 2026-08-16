import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { PaymentStatus, OrderStatus } from '@prisma/client';

describe('PaymentsService (Razorpay Signature Verification & Webhook Deduplication)', () => {
  let service: PaymentsService;

  const mockRepository = {
    findById: jest.fn(),
    findByProviderOrderId: jest.fn(),
    createPayment: jest.fn(),
    updatePaymentStatus: jest.fn(),
    createEvent: jest.fn(),
  };

  const mockPaymentProvider = {
    createPaymentOrder: jest.fn().mockResolvedValue({
      providerOrderId: 'order_rzp_123',
      amount: 1798,
      currency: 'INR',
      providerKey: 'rzp_test_key',
    }),
    verifyPaymentSignature: jest.fn(),
    verifyWebhookSignature: jest.fn(),
  };

  const mockPrismaService = {
    order: { findUnique: jest.fn(), update: jest.fn() },
    payment: { update: jest.fn() },
    orderStatusHistory: { create: jest.fn() },
    paymentEvent: { create: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockRepository },
        { provide: 'PAYMENT_PROVIDER', useValue: mockPaymentProvider },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  it('Should create payment order taking amount from Order.total', async () => {
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 'ord-1',
      userId: 'user-1',
      total: 1798,
      orderNumber: 'UV-20260815-0001',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    mockRepository.createPayment.mockResolvedValue({
      id: 'pay-1',
      amount: 1798,
      providerOrderId: 'order_rzp_123',
      status: PaymentStatus.CREATED,
    });

    const result = await service.createPayment('user-1', 'ord-1', { method: 'CARD' as any });

    expect(result.amount).toBe(1798);
    expect(mockPaymentProvider.createPaymentOrder).toHaveBeenCalledWith({
      orderId: 'ord-1',
      amount: 1798,
      currency: 'INR',
      metadata: expect.any(Object),
    });
  });

  it('Should verify HMAC signature and update Payment and Order to PAID / CONFIRMED', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'pay-1',
      orderId: 'ord-1',
      status: PaymentStatus.CREATED,
      order: { id: 'ord-1', userId: 'user-1', status: OrderStatus.PENDING },
    });

    mockPaymentProvider.verifyPaymentSignature.mockResolvedValue(true);

    mockPrismaService.payment.update.mockResolvedValue({ id: 'pay-1', status: PaymentStatus.PAID });
    mockPrismaService.order.update.mockResolvedValue({ id: 'ord-1', status: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID });

    const response = await service.verifyPayment('user-1', {
      paymentId: 'pay-1',
      providerPaymentId: 'pay_rzp_999',
      providerOrderId: 'order_rzp_123',
      signature: 'valid_sig',
    });

    expect(response.success).toBe(true);
    expect(mockPrismaService.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-1' },
      data: { paymentStatus: PaymentStatus.PAID, status: OrderStatus.CONFIRMED },
    });
  });

  it('Should throw BadRequestException if signature verification fails', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'pay-1',
      orderId: 'ord-1',
      status: PaymentStatus.CREATED,
      order: { id: 'ord-1', userId: 'user-1' },
    });

    mockPaymentProvider.verifyPaymentSignature.mockResolvedValue(false);

    await expect(
      service.verifyPayment('user-1', {
        paymentId: 'pay-1',
        providerPaymentId: 'pay_rzp_999',
        providerOrderId: 'order_rzp_123',
        signature: 'invalid_sig',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
