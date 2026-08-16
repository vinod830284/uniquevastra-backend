import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
export declare class PublicPaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(userId: string, orderId: string, dto: CreatePaymentDto): Promise<{
        paymentId: string;
        orderId: string;
        orderNumber: string;
        amount: number;
        currency: string;
        providerOrderId: string;
        providerKey: string;
    }>;
    retryPayment(userId: string, orderId: string, dto: CreatePaymentDto): Promise<{
        paymentId: string;
        orderId: string;
        orderNumber: string;
        amount: number;
        currency: string;
        providerOrderId: string;
        providerKey: string;
    }>;
    verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<{
        success: boolean;
        message: string;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            provider: import("@prisma/client").$Enums.PaymentProviderType;
            providerPaymentId: string | null;
            providerOrderId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            failureReason: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            userId: string;
            total: import("@prisma/client/runtime/library").Decimal;
            couponCode: string | null;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            orderNumber: string;
            idempotencyKey: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            notes: string | null;
            couponDiscount: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            deliveryFee: import("@prisma/client/runtime/library").Decimal;
        };
    } | {
        success: boolean;
        message: string;
        payment: {
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
                    total: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                    discount: import("@prisma/client/runtime/library").Decimal;
                    orderId: string;
                    productName: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.OrderStatus;
                userId: string;
                total: import("@prisma/client/runtime/library").Decimal;
                couponCode: string | null;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                orderNumber: string;
                idempotencyKey: string | null;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                notes: string | null;
                couponDiscount: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discount: import("@prisma/client/runtime/library").Decimal;
                deliveryFee: import("@prisma/client/runtime/library").Decimal;
            };
            events: {
                id: string;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            failureReason: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    getOrderPayments(userId: string, orderId: string): Promise<({
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        failureReason: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    handleWebhook(signature: string, payload: any): Promise<{
        status: string;
        reason: string;
        eventId?: undefined;
    } | {
        status: string;
        eventId: any;
        reason?: undefined;
    }>;
}
export declare class AdminPaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(query: PaymentQueryDto): Promise<{
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
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            failureReason: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<{
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
                total: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                discount: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                productName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            userId: string;
            total: import("@prisma/client/runtime/library").Decimal;
            couponCode: string | null;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            orderNumber: string;
            idempotencyKey: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            notes: string | null;
            couponDiscount: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            deliveryFee: import("@prisma/client/runtime/library").Decimal;
        };
        events: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        failureReason: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
