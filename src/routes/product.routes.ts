import productController from "../controllers/product.controller";
import { NextFunction, Router, Request, Response } from "express";
import upload from "../middleware/multer";
import multer from "multer";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const Productroutes = Router()

// favourite products routes 
Productroutes.get("/favourite/:userId", authenticate, productController.getFavouriteProducts);
Productroutes.post("/favourite/sync", authenticate, productController.syncFavourites);
Productroutes.post("/favourite/:_id", authenticate, productController.postFavouriteProducts);


// Public routes
Productroutes.get("/", productController.GatAllProducts);
Productroutes.get("/trending", productController.getTrendingProducts);
Productroutes.post("/trending", productController.postTrendingProducts);
Productroutes.get("/category/:category", productController.getProdutByCategory);
Productroutes.get("/search", productController.getProductBySearch);
Productroutes.get("/:_id", productController.getProductById);

// Admin-only routes
Productroutes.post(
    "/post-product",
    authenticate,
    authorizeRoles("Admin"),
    upload.single("image"),
    productController.createProduct
);

Productroutes.put(
    "/update/:_id",
    authenticate,
    authorizeRoles("Admin"),
    upload.single("image"),
    productController.updateProducts
);

Productroutes.delete(
    "/:_id",
    authenticate,
    authorizeRoles("Admin"),
    productController.delteProduct
);

// Error handling middleware for multer - must be at the end
Productroutes.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
        });
    }
    next();
});


export default Productroutes;