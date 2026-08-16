import { CouponType } from '@prisma/client';
export declare class CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    minimumOrderValue?: number;
    maximumDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
    perUserLimit?: number;
}
