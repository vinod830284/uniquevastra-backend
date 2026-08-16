import { PaymentMethod } from '@prisma/client';
export declare class CreateOrderDto {
    addressId: string;
    paymentMethod: PaymentMethod;
    notes?: string;
}
