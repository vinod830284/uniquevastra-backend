import { PrismaService } from '../../../database/prisma.service';
import { PaymentQueryDto } from '../dto/payment-query.dto';
import { PaymentStatus, Prisma } from '@prisma/client';
export declare class PaymentsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<({
        order: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
            };
            items: {
                id: string;
                createdAt: Date;
                imageUrl: string | null;
                variantId: string;
                sku: string;
                size: string;
                color: string;
                productId: string;
                total: Prisma.Decimal;
                quantity: number;
                discount: Prisma.Decimal;
                orderId: string;
                productName: string;
                unitPrice: Prisma.Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            userId: string;
            total: Prisma.Decimal;
            couponCode: string | null;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            orderNumber: string;
            idempotencyKey: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            notes: string | null;
            couponDiscount: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            discount: Prisma.Decimal;
            deliveryFee: Prisma.Decimal;
        };
        events: {
            id: string;
            createdAt: Date;
            metadata: Prisma.JsonValue | null;
            providerEventId: string | null;
            paymentId: string;
            eventType: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        provider: import("@prisma/client").$Enums.PaymentProviderType;
        providerPaymentId: string | null;
        providerOrderId: string | null;
        amount: Prisma.Decimal;
        currency: string;
        failureReason: string | null;
        metadata: Prisma.JsonValue | null;
    }) | null>;
    findByProviderOrderId(providerOrderId: string): Promise<({
        order: {
            items: {
                id: string;
                createdAt: Date;
                imageUrl: string | null;
                variantId: string;
                sku: string;
                size: string;
                color: string;
                productId: string;
                total: Prisma.Decimal;
                quantity: number;
                discount: Prisma.Decimal;
                orderId: string;
                productName: string;
                unitPrice: Prisma.Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            userId: string;
            total: Prisma.Decimal;
            couponCode: string | null;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            orderNumber: string;
            idempotencyKey: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            notes: string | null;
            couponDiscount: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            discount: Prisma.Decimal;
            deliveryFee: Prisma.Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        provider: import("@prisma/client").$Enums.PaymentProviderType;
        providerPaymentId: string | null;
        providerOrderId: string | null;
        amount: Prisma.Decimal;
        currency: string;
        failureReason: string | null;
        metadata: Prisma.JsonValue | null;
    }) | null>;
    findOrderPayments(orderId: string): Promise<({
        events: {
            id: string;
            createdAt: Date;
            metadata: Prisma.JsonValue | null;
            providerEventId: string | null;
            paymentId: string;
            eventType: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        provider: import("@prisma/client").$Enums.PaymentProviderType;
        providerPaymentId: string | null;
        providerOrderId: string | null;
        amount: Prisma.Decimal;
        currency: string;
        failureReason: string | null;
        metadata: Prisma.JsonValue | null;
    })[]>;
    createPayment(data: Prisma.PaymentCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        provider: import("@prisma/client").$Enums.PaymentProviderType;
        providerPaymentId: string | null;
        providerOrderId: string | null;
        amount: Prisma.Decimal;
        currency: string;
        failureReason: string | null;
        metadata: Prisma.JsonValue | null;
    }>;
    updatePaymentStatus(id: string, status: PaymentStatus, providerPaymentId?: string, failureReason?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        provider: import("@prisma/client").$Enums.PaymentProviderType;
        providerPaymentId: string | null;
        providerOrderId: string | null;
        amount: Prisma.Decimal;
        currency: string;
        failureReason: string | null;
        metadata: Prisma.JsonValue | null;
    }>;
    createEvent(paymentId: string, eventType: string, providerEventId?: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        metadata: Prisma.JsonValue | null;
        providerEventId: string | null;
        paymentId: string;
        eventType: string;
    }>;
    findAllAdmin(query: PaymentQueryDto): Promise<{
        items: ({
            order: {
                id: string;
                user: {
                    email: string;
                    name: string;
                };
                orderNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            provider: import("@prisma/client").$Enums.PaymentProviderType;
            providerPaymentId: string | null;
            providerOrderId: string | null;
            amount: Prisma.Decimal;
            currency: string;
            failureReason: string | null;
            metadata: Prisma.JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
