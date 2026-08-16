import { PrismaService } from '../../../database/prisma.service';
import { CouponStatus, Prisma } from '@prisma/client';
export declare class CouponsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findByCode(code: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: Prisma.Decimal;
        minimumOrderValue: Prisma.Decimal;
        maximumDiscount: Prisma.Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    } | null>;
    findById(id: string): Promise<({
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
        value: Prisma.Decimal;
        minimumOrderValue: Prisma.Decimal;
        maximumDiscount: Prisma.Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }) | null>;
    countUserUsages(couponId: string, userId: string): Promise<number>;
    countTotalUsages(couponId: string): Promise<number>;
    create(data: Prisma.CouponCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: Prisma.Decimal;
        minimumOrderValue: Prisma.Decimal;
        maximumDiscount: Prisma.Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }>;
    update(id: string, data: Prisma.CouponUpdateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: Prisma.Decimal;
        minimumOrderValue: Prisma.Decimal;
        maximumDiscount: Prisma.Decimal | null;
        usageLimit: number | null;
        perUserLimit: number;
    }>;
    setStatus(id: string, status: CouponStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CouponStatus;
        startDate: Date;
        endDate: Date;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        value: Prisma.Decimal;
        minimumOrderValue: Prisma.Decimal;
        maximumDiscount: Prisma.Decimal | null;
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
            value: Prisma.Decimal;
            minimumOrderValue: Prisma.Decimal;
            maximumDiscount: Prisma.Decimal | null;
            usageLimit: number | null;
            perUserLimit: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUsages(couponId: string, limit?: number): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        order: {
            id: string;
            total: Prisma.Decimal;
            orderNumber: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        orderId: string;
        couponId: string;
        discountAmount: Prisma.Decimal;
    })[]>;
}
