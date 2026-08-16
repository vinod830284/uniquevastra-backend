import { PaymentStatus, PaymentMethod, PaymentProviderType } from '@prisma/client';
export declare class PaymentQueryDto {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    method?: PaymentMethod;
    provider?: PaymentProviderType;
    orderId?: string;
}
