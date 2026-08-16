import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CouponStatus, Prisma } from '@prisma/client';

@Injectable()
export class CouponsRepository {
  constructor(private prisma: PrismaService) {}

  async findByCode(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    return this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });
  }

  async findById(id: string) {
    return this.prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
      },
    });
  }

  async countUserUsages(couponId: string, userId: string): Promise<number> {
    return this.prisma.couponUsage.count({
      where: { couponId, userId },
    });
  }

  async countTotalUsages(couponId: string): Promise<number> {
    return this.prisma.couponUsage.count({
      where: { couponId },
    });
  }

  async create(data: Prisma.CouponCreateInput) {
    return this.prisma.coupon.create({ data });
  }

  async update(id: string, data: Prisma.CouponUpdateInput) {
    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async setStatus(id: string, status: CouponStatus) {
    return this.prisma.coupon.update({
      where: { id },
      data: { status },
    });
  }

  async findAllAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { usages: true } },
        },
      }),
      this.prisma.coupon.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsages(couponId: string, limit = 50) {
    return this.prisma.couponUsage.findMany({
      where: { couponId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true, total: true } },
      },
    });
  }
}
