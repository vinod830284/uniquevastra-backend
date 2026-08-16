import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaymentQueryDto } from '../dto/payment-query.dto';
import { PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            items: true,
          },
        },
        events: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findByProviderOrderId(providerOrderId: string) {
    return this.prisma.payment.findFirst({
      where: { providerOrderId },
      include: { order: { include: { items: true } } },
    });
  }

  async findOrderPayments(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: { events: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async createPayment(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({ data });
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    providerPaymentId?: string,
    failureReason?: string,
  ) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(providerPaymentId ? { providerPaymentId } : {}),
        ...(failureReason ? { failureReason } : {}),
      },
    });
  }

  async createEvent(
    paymentId: string,
    eventType: string,
    providerEventId?: string,
    metadata?: any,
  ) {
    if (providerEventId) {
      const existing = await this.prisma.paymentEvent.findUnique({
        where: { providerEventId },
      });
      if (existing) return existing; // Webhook Deduplication!
    }

    return this.prisma.paymentEvent.create({
      data: {
        paymentId,
        eventType,
        providerEventId,
        metadata: metadata || Prisma.JsonNull,
      },
    });
  }

  async findAllAdmin(query: PaymentQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.method) where.method = query.method;
    if (query.provider) where.provider = query.provider;
    if (query.orderId) where.orderId = query.orderId;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: { id: true, orderNumber: true, user: { select: { name: true, email: true } } },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
