import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { AddProductImageDto, ReorderProductImagesDto } from './dto/image-management.dto';
import { PublicProductResponseDto, AdminProductResponseDto } from './dto/product-response.dto';
import { PricingUtil } from '../../common/utils/pricing.util';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private repository: ProductsRepository) {}

  async findAllPublic(query: ProductQueryDto) {
    const result = await this.repository.findAll(query, true);
    return {
      items: result.items.map((item) => PublicProductResponseDto.fromEntity(item)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async findAllAdmin(query: ProductQueryDto) {
    const result = await this.repository.findAll(query, false);
    return {
      items: result.items.map((item) => AdminProductResponseDto.fromEntity(item)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async findBySlugPublic(slug: string) {
    const product = await this.repository.findBySlug(slug, true);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }
    return PublicProductResponseDto.fromEntity(product);
  }

  async findByIdAdmin(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    return AdminProductResponseDto.fromEntity(product);
  }

  async create(dto: CreateProductDto) {
    const existingSlug = await this.repository.findBySlug(dto.slug, false);
    if (existingSlug) {
      throw new ConflictException(`Product slug '${dto.slug}' already exists`);
    }

    for (const vDto of dto.variants) {
      PricingUtil.validatePricing(vDto);
      const existingSku = await this.repository.findVariantBySku(vDto.sku);
      if (existingSku) {
        throw new ConflictException(`SKU '${vDto.sku}' already exists`);
      }
    }

    const created = await this.repository.create(dto);
    return AdminProductResponseDto.fromEntity(created);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Product not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.repository.findBySlug(dto.slug, false);
      if (slugConflict) {
        throw new ConflictException(`Product slug '${dto.slug}' already exists`);
      }
    }

    const updated = await this.repository.update(id, dto);
    return AdminProductResponseDto.fromEntity(updated);
  }

  async publish(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    const errors: string[] = [];

    if (!product.name || product.name.trim() === '') {
      errors.push('Product name is required');
    }
    if (!product.categoryId) {
      errors.push('Product category is required');
    }
    if (!product.variants || product.variants.length === 0) {
      errors.push('Product must have at least one variant before publishing');
    } else {
      const activeVariants = product.variants.filter((v) => v.status === 'ACTIVE');
      if (activeVariants.length === 0) {
        errors.push('Product must have at least one ACTIVE variant');
      }
    }

    if (!product.images || product.images.length === 0) {
      errors.push('Product must have at least one product image before publishing');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Cannot publish product due to incomplete metadata',
        errors,
      });
    }

    const published = await this.repository.setStatus(id, ProductStatus.ACTIVE);
    return {
      message: 'Product published successfully to customer catalog',
      status: published.status,
    };
  }

  async archive(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    const archived = await this.repository.setStatus(id, ProductStatus.ARCHIVED);
    return {
      message: 'Product archived successfully',
      status: archived.status,
    };
  }

  async duplicate(id: string) {
    const source = await this.repository.findById(id);
    if (!source) {
      throw new NotFoundException(`Product not found`);
    }

    const timestamp = Date.now().toString().slice(-6);
    const newSlug = `${source.slug}-copy-${timestamp}`;

    const duplicateDto: CreateProductDto = {
      name: `${source.name} (Copy)`,
      slug: newSlug,
      shortDescription: source.shortDescription || undefined,
      description: source.description,
      brand: source.brand,
      categoryId: source.categoryId,
      status: ProductStatus.DRAFT,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      fabricDetails: source.fabricDetails || undefined,
      careInstructions: source.careInstructions || undefined,
      fit: source.fit || undefined,
      seoTitle: source.seoTitle || undefined,
      seoDescription: source.seoDescription || undefined,
      images: source.images.map((img) => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl || undefined,
        altText: img.altText || undefined,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
      variants: source.variants.map((v) => ({
        sku: `${v.sku}-COPY-${timestamp}`,
        size: v.size,
        color: v.color,
        colorCode: v.colorCode || undefined,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        costPrice: v.costPrice ? Number(v.costPrice) : undefined,
        status: v.status,
      })),
    };

    const created = await this.repository.create(duplicateDto);
    return AdminProductResponseDto.fromEntity(created);
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    PricingUtil.validatePricing(dto);
    const existingSku = await this.repository.findVariantBySku(dto.sku);
    if (existingSku) {
      throw new ConflictException(`SKU '${dto.sku}' already exists`);
    }

    return this.repository.addVariant(productId, dto);
  }

  async addImage(productId: string, dto: AddProductImageDto) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    return this.repository.addImage(productId, dto);
  }

  async deleteImage(productId: string, imageId: string) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    return this.repository.deleteImage(imageId);
  }

  async reorderImages(productId: string, dto: ReorderProductImagesDto) {
    return this.repository.reorderImages(productId, dto.items);
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return this.repository.setPrimaryImage(productId, imageId);
  }
}
