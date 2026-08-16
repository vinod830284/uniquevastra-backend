import { PricingUtil } from '../../../common/utils/pricing.util';

export class PublicVariantResponseDto {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorCode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  discountPercentage: number;
  available: boolean;
  status: string;

  static fromEntity(variant: any): PublicVariantResponseDto {
    const priceNum = Number(variant.price);
    const compareAtNum = variant.compareAtPrice ? Number(variant.compareAtPrice) : null;
    
    // Calculate stock availability
    let available = true;
    if (variant.inventory) {
      const stock = variant.inventory.stock || 0;
      const reserved = variant.inventory.reservedStock || 0;
      available = stock - reserved > 0;
    }

    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorCode: variant.colorCode,
      price: priceNum,
      compareAtPrice: compareAtNum,
      discountPercentage: PricingUtil.calculateDiscountPercentage(priceNum, compareAtNum || undefined),
      available,
      status: variant.status,
    };
  }
}

export class PublicProductResponseDto {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  brand: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  collections: {
    id: string;
    name: string;
    slug: string;
  }[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  fabricDetails?: string | null;
  careInstructions?: string | null;
  fit?: string | null;
  images: {
    id: string;
    url: string;
    thumbnailUrl?: string | null;
    altText?: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  variants: PublicVariantResponseDto[];
  minPrice: number;
  maxPrice: number;
  maxDiscountPercentage: number;
  createdAt: string;

  static fromEntity(product: any): PublicProductResponseDto {
    const activeVariants = (product.variants || []).filter((v: any) => v.status === 'ACTIVE');
    const variantDtos = activeVariants.map((v: any) => PublicVariantResponseDto.fromEntity(v));

    const prices = variantDtos.map((v: PublicVariantResponseDto) => v.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const discounts = variantDtos.map((v: PublicVariantResponseDto) => v.discountPercentage);
    const maxDiscountPercentage = discounts.length > 0 ? Math.max(...discounts) : 0;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      brand: product.brand,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      collections: (product.collections || []).map((c: any) => ({
        id: c.collection.id,
        name: c.collection.name,
        slug: c.collection.slug,
      })),
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      fabricDetails: product.fabricDetails,
      careInstructions: product.careInstructions,
      fit: product.fit,
      images: (product.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
      variants: variantDtos,
      minPrice,
      maxPrice,
      maxDiscountPercentage,
      createdAt: product.createdAt.toISOString(),
    };
  }
}

export class AdminVariantResponseDto extends PublicVariantResponseDto {
  costPrice?: number | null;
  stock?: number;
  reservedStock?: number;
  availableStock?: number;
  lowStockThreshold?: number;
  createdAt: string;
  updatedAt: string;

  static override fromEntity(variant: any): AdminVariantResponseDto {
    const base = PublicVariantResponseDto.fromEntity(variant);
    const stock = variant.inventory?.stock ?? 0;
    const reservedStock = variant.inventory?.reservedStock ?? 0;
    const availableStock = Math.max(0, stock - reservedStock);

    return {
      ...base,
      costPrice: variant.costPrice ? Number(variant.costPrice) : null,
      stock,
      reservedStock,
      availableStock,
      lowStockThreshold: variant.inventory?.lowStockThreshold ?? 5,
      createdAt: variant.createdAt ? variant.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: variant.updatedAt ? variant.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}

export class AdminProductResponseDto extends PublicProductResponseDto {
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt: string;

  static override fromEntity(product: any): AdminProductResponseDto {
    const base = PublicProductResponseDto.fromEntity(product);
    const adminVariants = (product.variants || []).map((v: any) => AdminVariantResponseDto.fromEntity(v));

    return {
      ...base,
      status: product.status,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      variants: adminVariants,
      updatedAt: product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
