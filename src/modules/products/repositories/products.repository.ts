import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { AddProductImageDto } from '../dto/image-management.dto';
import { Prisma, ProductStatus, StockAdjustmentType } from '@prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto, onlyActive = true) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (onlyActive) {
      where.status = ProductStatus.ACTIVE;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.collection) {
      where.collections = {
        some: { collection: { slug: query.collection } },
      };
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.isNewArrival !== undefined) {
      where.isNewArrival = query.isNewArrival;
    }

    if (query.isBestSeller !== undefined) {
      where.isBestSeller = query.isBestSeller;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined || query.size || query.color) {
      where.variants = {
        some: {
          ...(onlyActive ? { status: 'ACTIVE' } : {}),
          ...(query.minPrice !== undefined ? { price: { gte: query.minPrice } } : {}),
          ...(query.maxPrice !== undefined ? { price: { lte: query.maxPrice } } : {}),
          ...(query.size ? { size: { equals: query.size, mode: 'insensitive' } } : {}),
          ...(query.color ? { color: { contains: query.color, mode: 'insensitive' } } : {}),
        },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (query.sort === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (query.sort === 'name_desc') {
      orderBy = { name: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          variants: { include: { inventory: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          collections: { include: { collection: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { include: { inventory: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
  }

  async findBySlug(slug: string, onlyActive = true) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          where: onlyActive ? { status: 'ACTIVE' } : {},
          include: { inventory: true },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
  }

  async findVariantBySku(sku: string) {
    return this.prisma.productVariant.findUnique({
      where: { sku },
      include: { inventory: true },
    });
  }

  async create(dto: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          shortDescription: dto.shortDescription,
          description: dto.description,
          brand: dto.brand || 'UniqueVastra',
          categoryId: dto.categoryId,
          status: dto.status || ProductStatus.DRAFT,
          isFeatured: dto.isFeatured ?? false,
          isNewArrival: dto.isNewArrival ?? true,
          isBestSeller: dto.isBestSeller ?? false,
          fabricDetails: dto.fabricDetails,
          careInstructions: dto.careInstructions,
          fit: dto.fit,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
        },
      });

      if (dto.images && dto.images.length > 0) {
        await tx.productImage.createMany({
          data: dto.images.map((img, index) => ({
            productId: product.id,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            altText: img.altText,
            sortOrder: img.sortOrder ?? index,
            isPrimary: img.isPrimary ?? index === 0,
            variantId: img.variantId,
          })),
        });
      }

      for (const vDto of dto.variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: vDto.sku,
            size: vDto.size,
            color: vDto.color,
            colorCode: vDto.colorCode,
            price: vDto.price,
            compareAtPrice: vDto.compareAtPrice,
            costPrice: vDto.costPrice,
            status: vDto.status || 'ACTIVE',
          },
        });

        // Automatically create inventory record transactionally with variant creation
        const inventory = await tx.inventory.create({
          data: {
            variantId: variant.id,
            stock: 0,
            reservedStock: 0,
            lowStockThreshold: 5,
          },
        });

        await tx.stockHistory.create({
          data: {
            inventoryId: inventory.id,
            type: StockAdjustmentType.CORRECTION,
            quantity: 0,
            previousStock: 0,
            newStock: 0,
            reason: 'Initial variant inventory record created',
            referenceType: 'VARIANT_CREATION',
          },
        });
      }

      if (dto.collectionIds && dto.collectionIds.length > 0) {
        await tx.productCollection.createMany({
          data: dto.collectionIds.map((cId) => ({
            productId: product.id,
            collectionId: cId,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          variants: { include: { inventory: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          collections: { include: { collection: true } },
        },
      });
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
        ...(dto.description && { description: dto.description }),
        ...(dto.brand && { brand: dto.brand }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.status && { status: dto.status }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.isNewArrival !== undefined && { isNewArrival: dto.isNewArrival }),
        ...(dto.isBestSeller !== undefined && { isBestSeller: dto.isBestSeller }),
        ...(dto.fabricDetails !== undefined && { fabricDetails: dto.fabricDetails }),
        ...(dto.careInstructions !== undefined && { careInstructions: dto.careInstructions }),
        ...(dto.fit !== undefined && { fit: dto.fit }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      },
      include: {
        category: true,
        variants: { include: { inventory: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
  }

  async setStatus(id: string, status: ProductStatus) {
    return this.prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: dto.sku,
          size: dto.size,
          color: dto.color,
          colorCode: dto.colorCode,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          costPrice: dto.costPrice,
          status: dto.status || 'ACTIVE',
        },
      });

      const inventory = await tx.inventory.create({
        data: {
          variantId: variant.id,
          stock: 0,
          reservedStock: 0,
          lowStockThreshold: 5,
        },
      });

      await tx.stockHistory.create({
        data: {
          inventoryId: inventory.id,
          type: StockAdjustmentType.CORRECTION,
          quantity: 0,
          previousStock: 0,
          newStock: 0,
          reason: 'Initial variant inventory record created',
          referenceType: 'VARIANT_CREATION',
        },
      });

      return tx.productVariant.findUnique({
        where: { id: variant.id },
        include: { inventory: true },
      });
    });
  }

  async addImage(productId: string, dto: AddProductImageDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      return tx.productImage.create({
        data: {
          productId,
          url: dto.url,
          thumbnailUrl: dto.thumbnailUrl,
          altText: dto.altText,
          sortOrder: dto.sortOrder || 0,
          isPrimary: dto.isPrimary || false,
          variantId: dto.variantId,
        },
      });
    });
  }

  async updateImage(imageId: string, dto: Partial<AddProductImageDto>) {
    return this.prisma.productImage.update({
      where: { id: imageId },
      data: dto,
    });
  }

  async deleteImage(imageId: string) {
    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      return tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  async reorderImages(productId: string, items: { imageId: string; sortOrder: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.productImage.update({
          where: { id: item.imageId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}
