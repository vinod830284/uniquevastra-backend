export declare class PublicVariantResponseDto {
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
    static fromEntity(variant: any): PublicVariantResponseDto;
}
export declare class PublicProductResponseDto {
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
    static fromEntity(product: any): PublicProductResponseDto;
}
export declare class AdminVariantResponseDto extends PublicVariantResponseDto {
    costPrice?: number | null;
    stock?: number;
    reservedStock?: number;
    availableStock?: number;
    lowStockThreshold?: number;
    createdAt: string;
    updatedAt: string;
    static fromEntity(variant: any): AdminVariantResponseDto;
}
export declare class AdminProductResponseDto extends PublicProductResponseDto {
    status: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    updatedAt: string;
    static fromEntity(product: any): AdminProductResponseDto;
}
