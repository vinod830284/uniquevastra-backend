import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { PrismaService } from '../../database/prisma.service';
export declare class PublicCartCouponController {
    private readonly couponsService;
    private readonly prisma;
    constructor(couponsService: CouponsService, prisma: PrismaService);
    applyCoupon(userId: string, dto: ApplyCouponDto): Promise<{
        message: string;
        coupon: {
            code: any;
            type: any;
            value: number;
            discountAmount: number;
        };
    }>;
    removeCoupon(userId: string): Promise<{
        message: string;
    }>;
}
export declare class AdminCouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    findAll(page?: number, limit?: number): Promise<{
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
    findById(id: string): Promise<{
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
    create(dto: CreateCouponDto): Promise<{
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
    disable(id: string): Promise<{
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
    enable(id: string): Promise<{
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
    getUsage(id: string): Promise<({
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
