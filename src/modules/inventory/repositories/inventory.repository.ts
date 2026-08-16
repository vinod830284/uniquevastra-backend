import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { InventoryQueryDto } from '../dto/inventory-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private prisma: PrismaService) {}

  async findByVariantId(variantId: string) {
    return this.prisma.inventory.findUnique({
      where: { variantId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: InventoryQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};

    if (query.sku) {
      where.variant = { sku: { contains: query.sku, mode: 'insensitive' } };
    }

    if (query.search || query.category || query.size || query.color) {
      where.variant = {
        ...(where.variant as object),
        ...(query.size ? { size: { equals: query.size, mode: 'insensitive' } } : {}),
        ...(query.color ? { color: { contains: query.color, mode: 'insensitive' } } : {}),
        ...(query.search || query.category
          ? {
              product: {
                ...(query.category ? { category: { slug: query.category } } : {}),
                ...(query.search
                  ? {
                      OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { slug: { contains: query.search, mode: 'insensitive' } },
                      ],
                    }
                  : {}),
              },
            }
          : {}),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  category: true,
                  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
              },
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
          },
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHistory(inventoryId: string, limit = 50) {
    return this.prisma.stockHistory.findMany({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async updateThreshold(id: string, lowStockThreshold: number) {
    return this.prisma.inventory.update({
      where: { id },
      data: { lowStockThreshold },
    });
  }
}
