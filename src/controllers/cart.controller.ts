import { Request, Response } from "express";
import cartServices from "../services/cart.services";
import Product from "../models/Product";

class CartController {
    // 1. Get user's cart items
    async getCart(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const cart = await cartServices.getCartByUserId(userId);

            res.status(200).json({
                success: true,
                message: "Cart fetched successfully",
                count: cart.length,
                cart,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // 2. Add an item to cart (or increment quantity if it already exists)
    async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId || req.body.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
            const { productId, quantity } = req.body;

            if (!userId || !productId) {
                res.status(400).json({
                    success: false,
                    message: "User ID and Product ID are required",
                });
                return;
            }

            // Extract optional details from body or fallback to looking up Product in DB
            let { title, description, price, category, image, brand, rating } = req.body;

            if (!title || price === undefined) {
                const product = await Product.findById(productId);
                if (!product) {
                    res.status(404).json({
                        success: false,
                        message: "Product not found",
                    });
                    return;
                }
                title = product.title;
                description = product.description;
                price = product.price;
                category = product.category;
                image = product.image;
                brand = product.brand;
                rating = product.rating;
            }

            const item = await cartServices.addToCart({
                userId,
                productId,
                quantity: Number(quantity) || 1,
                title,
                description,
                price,
                category,
                image,
                brand,
                rating,
            });

            res.status(200).json({
                success: true,
                message: "Item added to cart successfully",
                item,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // 3. Update item quantity (+ / -)
    async updateQuantity(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId || req.body.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
            const rawProductId = req.params.productId || req.body.productId;
            const productId = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;
            const quantity = Number(req.body.quantity);

            if (!userId || !productId || isNaN(quantity)) {
                res.status(400).json({
                    success: false,
                    message: "User ID, Product ID, and numeric quantity are required",
                });
                return;
            }

            const updatedCartItem = await cartServices.updateQuantity(
                userId,
                productId,
                quantity
            );

            res.status(200).json({
                success: true,
                message: quantity <= 0 ? "Item removed from cart" : "Cart quantity updated successfully",
                item: updatedCartItem,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // 4. Remove a specific item from cart
    async removeFromCart(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
            const rawProductId = req.params.productId;
            const productId = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;

            if (!userId || !productId) {
                res.status(400).json({
                    success: false,
                    message: "User ID and Product ID are required",
                });
                return;
            }

            await cartServices.removeFromCart(userId, productId);

            res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // 5. Clear entire cart (checkout completed or reset)
    async clearCart(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            await cartServices.clearCart(userId);

            res.status(200).json({
                success: true,
                message: "Cart cleared successfully",
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // 6. Get total item count in user's cart (for navbar badge)
    async getCartCount(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const count = await cartServices.getCartCount(userId);

            res.status(200).json({
                success: true,
                count,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // 7. Batch sync guest cart items upon login
    async syncCart(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.body.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
            const { items } = req.body;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            if (!Array.isArray(items)) {
                res.status(400).json({
                    success: false,
                    message: "Items must be an array",
                });
                return;
            }

            const populatedItems = [];
            for (const item of items) {
                if (!item.productId) continue;
                let { productId, quantity, title, description, price, category, image, brand, rating } = item;
                if (!title || price === undefined) {
                    const product = await Product.findById(productId);
                    if (product) {
                        title = product.title;
                        description = product.description;
                        price = product.price;
                        category = product.category;
                        image = product.image;
                        brand = product.brand;
                        rating = product.rating;
                    }
                }
                populatedItems.push({
                    productId,
                    quantity: Number(quantity) || 1,
                    title: title || "Product",
                    description: description || "",
                    price: price !== undefined ? Number(price) : 0,
                    category: category || "",
                    image: Array.isArray(image) ? image : (image ? [image] : []),
                    brand: brand || "",
                    rating,
                });
            }

            const updatedCart = await cartServices.syncCart(userId, populatedItems);

            res.status(200).json({
                success: true,
                message: "Cart synced successfully",
                count: updatedCart.length,
                cart: updatedCart,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new CartController();