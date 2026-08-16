export declare class AddCollectionProductDto {
    productId: string;
    sortOrder?: number;
}
export declare class ReorderCollectionProductItem {
    productId: string;
    sortOrder: number;
}
export declare class ReorderCollectionProductsDto {
    items: ReorderCollectionProductItem[];
}
