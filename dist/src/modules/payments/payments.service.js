"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const payments_repository_1 = require("./repositories/payments.repository");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    repository;
    paymentProvider;
    prisma;
    constructor(repository, paymentProvider, prisma) {
        this.repository = repository;
        this.paymentProvider = paymentProvider;
        this.prisma = prisma;
    }
    async createPayment(userId, orderId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to pay for this order');
        }
        if (order.paymentStatus === client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('This order has already been paid');
        }
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot initiate payment for a cancelled order');
        }
        const amount = Number(order.total);
        const providerResult = await this.paymentProvider.createPaymentOrder({
            orderId: order.id,
            amount,
            currency: 'INR',
            metadata: { orderNumber: order.orderNumber, userId },
        });
        const payment = await this.repository.createPayment({
            order: { connect: { id: order.id } },
            provider: client_1.PaymentProviderType.RAZORPAY,
            method: dto.method,
            amount,
            currency: providerResult.currency,
            providerOrderId: providerResult.providerOrderId,
            status: client_1.PaymentStatus.CREATED,
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
    async verifyPayment(userId, dto) {
        const payment = await this.repository.findById(dto.paymentId);
        if (!payment) {
            throw new common_1.NotFoundException('Payment record not found');
        }
        if (payment.order.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to verify this payment');
        }
        if (payment.status === client_1.PaymentStatus.PAID) {
            return { success: true, message: 'Payment already verified', payment };
        }
        const isValid = await this.paymentProvider.verifyPaymentSignature({
            providerPaymentId: dto.providerPaymentId,
            providerOrderId: dto.providerOrderId,
            signature: dto.signature,
        });
        if (!isValid) {
            await this.repository.updatePaymentStatus(payment.id, client_1.PaymentStatus.FAILED, dto.providerPaymentId, 'Invalid signature verification failure');
            await this.repository.createEvent(payment.id, 'payment.failed', undefined, {
                reason: 'Signature mismatch',
            });
            throw new common_1.BadRequestException('Payment signature verification failed');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.PAID,
                    providerPaymentId: dto.providerPaymentId,
                },
            });
            const updatedOrder = await tx.order.update({
                where: { id: payment.orderId },
                data: {
                    paymentStatus: client_1.PaymentStatus.PAID,
                    status: client_1.OrderStatus.CONFIRMED,
                },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    fromStatus: orderStatusToEnum(payment.order.status),
                    toStatus: client_1.OrderStatus.CONFIRMED,
                    changedBy: userId,
                    reason: `Payment verified successfully (${dto.providerPaymentId})`,
                },
            });
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
    async handleWebhook(rawBody, signature, payload) {
        const isValid = this.paymentProvider.verifyWebhookSignature(rawBody, signature, '');
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid webhook signature');
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
        const existingEvent = await this.prisma.paymentEvent.findUnique({
            where: { providerEventId: eventId },
        });
        if (existingEvent) {
            return { status: 'ignored', reason: 'Webhook event already processed' };
        }
        if (event === 'payment.captured' || event === 'order.paid') {
            if (localPayment.status !== client_1.PaymentStatus.PAID) {
                await this.prisma.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { id: localPayment.id },
                        data: { status: client_1.PaymentStatus.PAID, providerPaymentId },
                    });
                    await tx.order.update({
                        where: { id: localPayment.orderId },
                        data: { paymentStatus: client_1.PaymentStatus.PAID, status: client_1.OrderStatus.CONFIRMED },
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
        }
        else if (event === 'payment.failed') {
            await this.repository.updatePaymentStatus(localPayment.id, client_1.PaymentStatus.FAILED, providerPaymentId, paymentEntity?.error_description || 'Payment failed via webhook notification');
            await this.repository.createEvent(localPayment.id, event, eventId, payload);
        }
        return { status: 'processed', eventId };
    }
    async getOrderPayments(userId, orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.repository.findOrderPayments(orderId);
    }
    async findAllAdmin(query) {
        return this.repository.findAllAdmin(query);
    }
    async findByIdAdmin(id) {
        const payment = await this.repository.findById(id);
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('PAYMENT_PROVIDER')),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository, Object, prisma_service_1.PrismaService])
], PaymentsService);
function orderStatusToEnum(status) {
    return status;
}
//# sourceMappingURL=payments.service.js.map