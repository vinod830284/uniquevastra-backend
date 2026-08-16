import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
import { CollectionStatus } from '@prisma/client';

@Injectable()
export class CollectionsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(onlyActive = true) {
    return this.prisma.collection.findMany({
      where: onlyActive ? { status: CollectionStatus.ACTIVE } : {},
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              include: {
                variants: true,
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string, onlyActive = true) {
    return this.prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              include: {
                variants: { where: onlyActive ? { status: 'ACTIVE' } : {} },
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async create(dto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        bannerImageUrl: dto.bannerImageUrl,
        status: dto.status || CollectionStatus.DRAFT,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder || 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async update(id: string, dto: UpdateCollectionDto) {
    return this.prisma.collection.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.bannerImageUrl !== undefined && { bannerImageUrl: dto.bannerImageUrl }),
        ...(dto.status && { status: dto.status }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
      },
    });
  }

  async archive(id: string) {
    return this.prisma.collection.update({
      where: { id },
      data: { status: CollectionStatus.ARCHIVED },
    });
  }

  async addProduct(collectionId: string, productId: string, sortOrder = 0) {
    return this.prisma.productCollection.upsert({
      where: {
        productId_collectionId: { productId, collectionId },
      },
      update: { sortOrder },
      create: { productId, collectionId, sortOrder },
    });
  }

  async removeProduct(collectionId: string, productId: string) {
    return this.prisma.productCollection.delete({
      where: {
        productId_collectionId: { productId, collectionId },
      },
    });
  }

  async reorderProducts(collectionId: string, items: { productId: string; sortOrder: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.productCollection.update({
          where: {
            productId_collectionId: { productId: item.productId, collectionId },
          },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}
