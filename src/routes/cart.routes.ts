import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";

const cartRoutes = Router();

// 1. Get total cart count (badge count)
cartRoutes.get("/count", authenticate, cartController.getCartCount);
cartRoutes.get("/count/:userId", authenticate, cartController.getCartCount);

// 2. Add item to cart
cartRoutes.post("/sync", authenticate, cartController.syncCart);
cartRoutes.post("/add", authenticate, cartController.addToCart);
cartRoutes.post("/", authenticate, cartController.addToCart);

// 3. Update item quantity
cartRoutes.put("/update/:productId", authenticate, cartController.updateQuantity);
cartRoutes.put("/update", authenticate, cartController.updateQuantity);

// 4. Clear entire cart (placed before parameterized routes to avoid matching conflicts)
cartRoutes.delete("/clear", authenticate, cartController.clearCart);
cartRoutes.delete("/clear/:userId", authenticate, cartController.clearCart);

// 5. Remove specific item from cart
cartRoutes.delete("/remove/:productId", authenticate, cartController.removeFromCart);
cartRoutes.delete("/:productId", authenticate, cartController.removeFromCart);

// 6. Get user cart items
cartRoutes.get("/", authenticate, cartController.getCart);
cartRoutes.get("/:userId", authenticate, cartController.getCart);

export default cartRoutes;
