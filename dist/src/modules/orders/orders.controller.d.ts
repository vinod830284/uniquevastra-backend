import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
export declare class PublicOrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    previewCheckout(userId: string, addressId?: string, couponCode?: string): Promise<{
        items: import("../pricing/pricing.service").CalculatedLineItem[];
        subtotal: number;
        couponDiscount: number;
        coupon: any;
        deliveryFee: number;
        total: number;
        currency: string;
        hasUnavailableItems: boolean;
    }>;
    createOrder(userId: string, dto: CreateOrderDto, idempotencyKey?: string): Promise<({
        address: {
            id: string;
            name: string;
            phone: string;
            createdAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            orderId: string;
        } | null;
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
    }) | null>;
    findUserOrders(userId: string, query: OrderQueryDto): Promise<{
        items: ({
            address: {
                id: string;
                name: string;
                phone: string;
                createdAt: Date;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string;
                postalCode: string;
                country: string;
                orderId: string;
            } | null;
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findUserOrderDetail(userId: string, orderId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
        address: {
            id: string;
            name: string;
            phone: string;
            createdAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            orderId: string;
        } | null;
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
        statusHistory: {
            id: string;
            createdAt: Date;
            reason: string | null;
            orderId: string;
            fromStatus: import("@prisma/client").$Enums.OrderStatus;
            toStatus: import("@prisma/client").$Enums.OrderStatus;
            changedBy: string;
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
    }>;
    cancelOrder(userId: string, orderId: string, reason?: string): Promise<{
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
    }>;
}
export declare class AdminOrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAllAdmin(query: OrderQueryDto): Promise<{
        items: ({
            user: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
            };
            address: {
                id: string;
                name: string;
                phone: string;
                createdAt: Date;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string;
                postalCode: string;
                country: string;
                orderId: string;
            } | null;
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByIdAdmin(orderId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
        address: {
            id: string;
            name: string;
            phone: string;
            createdAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            orderId: string;
        } | null;
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
        statusHistory: {
            id: string;
            createdAt: Date;
            reason: string | null;
            orderId: string;
            fromStatus: import("@prisma/client").$Enums.OrderStatus;
            toStatus: import("@prisma/client").$Enums.OrderStatus;
            changedBy: string;
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
    }>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto, adminUserId: string): Promise<{
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
    }>;
}
