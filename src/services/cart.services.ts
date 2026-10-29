import cartRepository from "../repositories/cartRepository";
import { Icart } from "../interfaces/Icart";


class CartService {
    // 1. Get all cart items for a specific user
    async getCartByUserId(userId: string) {
        return await cartRepository.getCartByUserId(userId);
    }

    // 2. Find a specific cart item for a user by productId
    async getCartItem(userId: string, productId: string) {
        return await cartRepository.getCartItem(userId, productId);
    }

    // 3. Add to cart (if already exists, increment quantity)
    async addToCart(cartData: Partial<Icart>) {
        return await cartRepository.addToCart(cartData);
    }

    // 4. Update quantity of a cart item
    async updateQuantity(userId: string, productId: string, quantity: number) {
        return await cartRepository.updateQuantity(userId, productId, quantity);
    }

    // 5. Remove an item from cart
    async removeFromCart(userId: string, productId: string) {
        return await cartRepository.removeFromCart(userId, productId);
    }

    // 6. Clear entire cart for a user (e.g. after placing an order)
    async clearCart(userId: string) {
        return await cartRepository.clearCart(userId);
    }

    // 7. Get total item count in user's cart
    async getCartCount(userId: string): Promise<number> {
        return await cartRepository.getCartCount(userId);
    }

    // 8. Batch sync guest cart items
    async syncCart(userId: string, items: Partial<Icart>[]) {
        return await cartRepository.syncCart(userId, items);
    }
}

export default new CartService();
