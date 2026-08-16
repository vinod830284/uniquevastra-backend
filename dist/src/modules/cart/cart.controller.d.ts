import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<{
        id: string;
        userId: string;
        items: import("../pricing/pricing.service").CalculatedLineItem[];
        subtotal: number;
        discount: number;
        deliveryFee: number;
        freeDeliveryThreshold: number;
        total: number;
        hasUnavailableItems: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    addItem(userId: string, dto: AddCartItemDto): Promise<{
        id: string;
        userId: string;
        items: import("../pricing/pricing.service").CalculatedLineItem[];
        subtotal: number;
        discount: number;
        deliveryFee: number;
        freeDeliveryThreshold: number;
        total: number;
        hasUnavailableItems: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<{
        id: string;
        userId: string;
        items: import("../pricing/pricing.service").CalculatedLineItem[];
        subtotal: number;
        discount: number;
        deliveryFee: number;
        freeDeliveryThreshold: number;
        total: number;
        hasUnavailableItems: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    removeItem(userId: string, itemId: string): Promise<{
        id: string;
        userId: string;
        items: import("../pricing/pricing.service").CalculatedLineItem[];
        subtotal: number;
        discount: number;
        deliveryFee: number;
        freeDeliveryThreshold: number;
        total: number;
        hasUnavailableItems: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    clearCart(userId: string): Promise<{
        id: string;
        userId: string;
        items: import("../pricing/pricing.service").CalculatedLineItem[];
        subtotal: number;
        discount: number;
        deliveryFee: number;
        freeDeliveryThreshold: number;
        total: number;
        hasUnavailableItems: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
}
