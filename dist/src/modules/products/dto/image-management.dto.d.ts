export declare class AddProductImageDto {
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    variantId?: string;
}
export declare class UpdateProductImageDto {
    url?: string;
    thumbnailUrl?: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    variantId?: string;
}
export declare class ReorderProductImageItem {
    imageId: string;
    sortOrder: number;
}
export declare class ReorderProductImagesDto {
    items: ReorderProductImageItem[];
}
