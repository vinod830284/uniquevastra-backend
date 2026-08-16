import { PrismaService } from '../../../database/prisma.service';
export declare class CartRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findOrCreateCart(userId: string): Promise<{
        items: ({
            variant: {
                images: {
                    id: string;
                    createdAt: Date;
                    sortOrder: number;
                    url: string;
                    thumbnailUrl: string | null;
                    altText: string | null;
                    isPrimary: boolean;
                    variantId: string | null;
                    productId: string;
                }[];
                product: {
                    category: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
                        status: import("@prisma/client").$Enums.CategoryStatus;
                        slug: string;
                        description: string | null;
                        imageUrl: string | null;
                        parentId: string | null;
                        sortOrder: number;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.ProductStatus;
                    slug: string;
                    description: string;
                    isFeatured: boolean;
                    shortDescription: string | null;
                    brand: string;
                    categoryId: string;
                    isNewArrival: boolean;
                    isBestSeller: boolean;
                    fabricDetails: string | null;
                    careInstructions: string | null;
                    fit: string | null;
                    seoTitle: string | null;
                    seoDescription: string | null;
                };
                inventory: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    variantId: string;
                    stock: number;
                    reservedStock: number;
                    lowStockThreshold: number;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.VariantStatus;
                sku: string;
                size: string;
                color: string;
                colorCode: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                productId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            variantId: string;
            quantity: number;
            cartId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        couponCode: string | null;
    }>;
    findCartItem(cartId: string, variantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        quantity: number;
        cartId: string;
    } | null>;
    findCartItemById(itemId: string): Promise<({
        cart: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            couponCode: string | null;
        };
        variant: {
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ProductStatus;
                slug: string;
                description: string;
                isFeatured: boolean;
                shortDescription: string | null;
                brand: string;
                categoryId: string;
                isNewArrival: boolean;
                isBestSeller: boolean;
                fabricDetails: string | null;
                careInstructions: string | null;
                fit: string | null;
                seoTitle: string | null;
                seoDescription: string | null;
            };
            inventory: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                variantId: string;
                stock: number;
                reservedStock: number;
                lowStockThreshold: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.VariantStatus;
            sku: string;
            size: string;
            color: string;
            colorCode: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            productId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        quantity: number;
        cartId: string;
    }) | null>;
    upsertCartItem(cartId: string, variantId: string, quantity: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        quantity: number;
        cartId: string;
    }>;
    updateItemQuantity(itemId: string, quantity: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        quantity: number;
        cartId: string;
    }>;
    deleteItem(itemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        variantId: string;
        quantity: number;
        cartId: string;
    }>;
    clearCart(cartId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
