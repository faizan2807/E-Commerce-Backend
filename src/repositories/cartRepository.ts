import { Icart } from "../interfaces/Icart";
import Cart from "../models/Cart";

class CartRepository {
    // 1. Get all cart items for a specific user
    async getCartByUserId(userId: string) {
        return await Cart.find({ userId });
    }

    // 2. Find a specific cart item for a user by productId
    async getCartItem(userId: string, productId: string) {
        return await Cart.findOne({ userId, productId });
    }

    // 3. Add to cart (if already exists, increment quantity)
    async addToCart(cartData: Partial<Icart>) {
        const existingItem = await Cart.findOne({
            userId: cartData.userId,
            productId: cartData.productId,
        });

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + (cartData.quantity || 1);
            return await existingItem.save();
        }

        return await Cart.create({
            ...cartData,
            quantity: cartData.quantity || 1,
        });
    }

    // 4. Update quantity of a cart item
    async updateQuantity(userId: string, productId: string, quantity: number) {
        if (quantity <= 0) {
            return await Cart.findOneAndDelete({ userId, productId });
        }

        return await Cart.findOneAndUpdate(
            { userId, productId },
            { $set: { quantity } },
            { returnDocument: "after" }
        );
    }

    // 5. Remove an item from cart
    async removeFromCart(userId: string, productId: string) {
        return await Cart.findOneAndDelete({ userId, productId });
    }

    // 6. Clear entire cart for a user (e.g. after placing an order)
    async clearCart(userId: string) {
        return await Cart.deleteMany({ userId });
    }

    // 7. Get total item count in user's cart
    async getCartCount(userId: string): Promise<number> {
        return await Cart.countDocuments({ userId });
    }

    // 8. Batch sync guest cart items for a user
    async syncCart(userId: string, items: Partial<Icart>[]) {
        for (const item of items) {
            if (!item.productId) continue;
            await this.addToCart({
                ...item,
                userId,
                quantity: Number(item.quantity) || 1,
            });
        }
        return await this.getCartByUserId(userId);
    }
}

export default new CartRepository();
