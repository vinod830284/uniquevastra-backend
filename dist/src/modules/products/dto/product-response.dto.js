"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductResponseDto = exports.AdminVariantResponseDto = exports.PublicProductResponseDto = exports.PublicVariantResponseDto = void 0;
const pricing_util_1 = require("../../../common/utils/pricing.util");
class PublicVariantResponseDto {
    id;
    sku;
    size;
    color;
    colorCode;
    price;
    compareAtPrice;
    discountPercentage;
    available;
    status;
    static fromEntity(variant) {
        const priceNum = Number(variant.price);
        const compareAtNum = variant.compareAtPrice ? Number(variant.compareAtPrice) : null;
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
            discountPercentage: pricing_util_1.PricingUtil.calculateDiscountPercentage(priceNum, compareAtNum || undefined),
            available,
            status: variant.status,
        };
    }
}
exports.PublicVariantResponseDto = PublicVariantResponseDto;
class PublicProductResponseDto {
    id;
    name;
    slug;
    shortDescription;
    description;
    brand;
    category;
    collections;
    isFeatured;
    isNewArrival;
    isBestSeller;
    fabricDetails;
    careInstructions;
    fit;
    images;
    variants;
    minPrice;
    maxPrice;
    maxDiscountPercentage;
    createdAt;
    static fromEntity(product) {
        const activeVariants = (product.variants || []).filter((v) => v.status === 'ACTIVE');
        const variantDtos = activeVariants.map((v) => PublicVariantResponseDto.fromEntity(v));
        const prices = variantDtos.map((v) => v.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const discounts = variantDtos.map((v) => v.discountPercentage);
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
            collections: (product.collections || []).map((c) => ({
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
            images: (product.images || []).map((img) => ({
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
exports.PublicProductResponseDto = PublicProductResponseDto;
class AdminVariantResponseDto extends PublicVariantResponseDto {
    costPrice;
    stock;
    reservedStock;
    availableStock;
    lowStockThreshold;
    createdAt;
    updatedAt;
    static fromEntity(variant) {
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
exports.AdminVariantResponseDto = AdminVariantResponseDto;
class AdminProductResponseDto extends PublicProductResponseDto {
    status;
    seoTitle;
    seoDescription;
    updatedAt;
    static fromEntity(product) {
        const base = PublicProductResponseDto.fromEntity(product);
        const adminVariants = (product.variants || []).map((v) => AdminVariantResponseDto.fromEntity(v));
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
exports.AdminProductResponseDto = AdminProductResponseDto;
//# sourceMappingURL=product-response.dto.js.map