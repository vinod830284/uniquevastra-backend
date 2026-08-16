import { OrderStatus, PaymentStatus } from '@prisma/client';
export declare class OrderQueryDto {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    orderNumber?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}
