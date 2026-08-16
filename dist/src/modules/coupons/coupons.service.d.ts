import { CouponsRepository } from './repositories/coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
export interface ValidatedCouponResult {
    coupon: any;
    discountAmount: number;
    freeDelivery: boolean;
}
export declare class CouponsService {
    private repository;
    constructor(repository: CouponsRepository);
    validateCoupon(code: string, userId: string, subtotal: number, deliveryFee?: number): Promise<ValidatedCouponResult>;
    createCoupon(dto: CreateCouponDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderValue: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }>;
    findAllAdmin(page?: number, limit?: number): Promise<{
        items: ({
            _count: {
                usages: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.CouponStatus;
            startDate: Date;
            endDate: Date;
            code: string;
            type: import("@prisma/client").$Enums.CouponType;
            value: import("@prisma/client/runtime/library").Decimal;
            minimumOrderValue: import("@prisma/client/runtime/library").Decimal;
            maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
            usageLimit: number | null;
            perUserLimit: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByIdAdmin(id: string): Promise<{
        _count: {
            usages: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderValue: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }>;
    disableCoupon(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderValue: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }>;
    enableCoupon(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderValue: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }>;
    getUsages(id: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        order: {
            id: string;
            total: import("@prisma/client/runtime/library").Decimal;
            orderNumber: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        orderId: string;
        couponId: string;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
}
