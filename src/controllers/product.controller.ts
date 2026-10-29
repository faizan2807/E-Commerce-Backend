import { Request, Response } from "express";
import productServices from "../services/product.services";

class ProductController {

    // get ALL Products with pagination, search, category, status, and sorting
    async GatAllProducts(req: Request, res: Response): Promise<void> {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit as string) || 10));
            const search = req.query.search as string;
            const category = req.query.category as string;
            const status = req.query.status as string;
            const sortBy = req.query.sortBy as string;
            const sortOrder = req.query.sortOrder as "asc" | "desc";

            const result = await productServices.GetAllProducts({
                page,
                limit,
                search,
                category,
                status,
                sortBy,
                sortOrder,
            });

            res.status(200).json({
                success: true,
                message: "Products fetched successfully",
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Get all products error:", error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }

    // ProductById
    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const { _id } = req.params;
            const productId: string = Array.isArray(_id) ? _id[0] : _id;
            const product = await productServices.GetProductById(productId);

            if (!product) {
                res.status(404).json({
                    success: false,
                    message: "Product Not Found"
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error: any) {
            if (error.status === 401) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }

    //get productby Search
    async getProductBySearch(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const search = req.query.search as string;

            if (!search || search.trim() === "") {
                res.status(400).json({
                    success: false,
                    message: "Search value is required",
                });
                return;
            }

            const productBySearch =
                await productServices.GetProductBySearch(search);

            if (productBySearch.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: productBySearch,
            });
        } catch (err) {
            console.error("Search product error:", err);

            res.status(500).json({
                success: false,
                message: "Failed to search product",
            });
        }
    }

    //  getProductByCategory
    async getProdutByCategory(req: Request, res: Response): Promise<void> {

        try {
            const { category: categoryparams } = req.params;
            const category = Array.isArray(categoryparams) ? categoryparams[0] : categoryparams;
            console.log("fetch category", category)
            const productBycategory = await productServices.GetProductByCategory(category)

            if (!category) {
                res.status(404).json({
                    status: false,
                    massage: "category not found"
                })
            }
            res.status(200).json({
                success: true,
                message: "product fetch successfully",
                data: productBycategory
            })
        } catch (err) {
            res.status(400).json({
                success: false,
                massage: "faild to fetch product by category",
            })
        }
    }

    async getFavouriteProducts(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId || req.query.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

            if (!userId || typeof userId !== "string") {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const favouriteProducts =
                await productServices.GetFavouriteProducts(userId);

            res.status(200).json({
                success: true,
                message: "Favourites fetched successfully",
                count: favouriteProducts.length,
                data: favouriteProducts,
            });
        } catch (error: any) {
            console.error("Favourite API error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to fetch favourite products",
            });
        }
    }

    async postFavouriteProducts(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.params.userId || req.body.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

            const rawProductId =
                req.params._id || req.params.productId || req.body.productId || req.body._id;
            const productId = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;

            if (!userId || !productId) {
                res.status(400).json({
                    success: false,
                    message: "User ID and Product ID are required",
                });
                return;
            }

            const explicitFavourite =
                req.body.favourite !== undefined ? Boolean(req.body.favourite) : undefined;

            const result = await productServices.postFavouriteProducts(
                productId,
                userId,
                explicitFavourite
            );

            res.status(200).json({
                success: true,
                message: result.isFavourite
                    ? "Product added to favourites"
                    : "Product removed from favourites",
                favourite: result.isFavourite,
                data: result.product,
            });
        } catch (error: any) {
            console.error("Post favourite error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update favourite status",
            });
        }
    }

    async syncFavourites(req: Request, res: Response): Promise<void> {
        try {
            const rawUserId = req.user?.id || req.body.userId;
            const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const rawItems = req.body.items || req.body.productIds || [];
            if (!Array.isArray(rawItems)) {
                res.status(400).json({
                    success: false,
                    message: "Items or productIds must be an array",
                });
                return;
            }

            const productIds: string[] = rawItems
                .map((item: any) => (typeof item === "string" ? item : item.productId || item._id))
                .filter(Boolean);

            const favourites = await productServices.syncFavourites(userId, productIds);

            res.status(200).json({
                success: true,
                message: "Favourites synced successfully",
                count: favourites.length,
                data: favourites,
            });
        } catch (error: any) {
            console.error("Sync favourites error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to sync favourites",
            });
        }
    }

    //Post Product
    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            console.log("REQ BODY:", req.body);
            console.log("REQ FILE:", req.file);

            let imageArray: string[] = [];
            if (req.file) {
                const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
                imageArray = [imageUrl];
            }

            const productData = {
                title: req.body.title,
                description: req.body.description,
                price: Number(req.body.price),
                category: req.body.category,
                image: imageArray,
                brand: req.body.brand,
                status: req.body.status,
                sellerId: req.body.sellerId
            };

            console.log("PRODUCT DATA:", productData);

            const createproduct = await productServices.createProduct(productData);

            res.status(201).json({
                success: true,
                message: "Product added successfully",
                data: createproduct,
            });

        } catch (error: any) {
            console.error("Create product error:", error);

            res.status(500).json({
                success: false,
                message: error.message || "Failed to add product",
                error: error.errors || undefined,
            });
        }
    }

    // Update Product

    async updateProducts(req: Request, res: Response): Promise<void> {

        try {
            const { _id } = req.params;
            const productId: string = Array.isArray(_id) ? _id[0] : _id;

            const updateData: any = { ...req.body };

            if (req.file) {
                const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
                updateData.image = [imageUrl];
            }

            if (updateData.price !== undefined && updateData.price !== "") {
                updateData.price = Number(updateData.price);
            }

            const updateproduct = await productServices.UpdateProducts(productId, updateData);
            if (!updateproduct) {
                res.status(404).json({
                    success: false,
                    message: "product not found"
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Product Updated Successfully",
                data: updateproduct
            });
        } catch (error: any) {
            if (error.status === 401) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal Server Error"
                });
            }
        }
    }

    // Delete Product
    async delteProduct(req: Request, res: Response): Promise<void> {
        try {
            const { _id } = req.params;
            const productId: string = Array.isArray(_id) ? _id[0] : _id;
            const deleteproduct = await productServices.DeleteProduct(productId);
            if (!deleteproduct) {
                res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (error: any) {
            if (error.status === 400) {
                res.status(400).json({
                    success: false,
                    message: "Failed to delete product"
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    }

    // GET Trending Products
    async getTrendingProducts(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 8;
            const category = req.query.category as string | undefined;

            const trending = await productServices.GetTrendingProducts(limit, category);

            res.status(200).json({
                success: true,
                message: "Trending products fetched successfully",
                count: trending.length,
                data: trending,
            });
        } catch (error: any) {
            console.error("Get trending products error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch trending products",
            });
        }
    }

    // post Trending Products 
    async postTrendingProducts(req: Request, res: Response): Promise<void> {
        try {
            const { limit, category, timeframeDays, minRating, sortBy } = req.body || {};

            const parsedLimit = limit !== undefined ? Number(limit) : 12;
            const parsedTimeframe = timeframeDays !== undefined ? Number(timeframeDays) : undefined;
            const parsedMinRating = minRating !== undefined ? Number(minRating) : undefined;

            const trending = await productServices.CalculateDynamicTrending({
                limit: parsedLimit,
                category,
                timeframeDays: parsedTimeframe,
                minRating: parsedMinRating,
                sortBy,
            });

            res.status(200).json({
                success: true,
                message: "Dynamic trending products calculated successfully",
                criteria: {
                    limit: parsedLimit,
                    category: category || null,
                    timeframeDays: parsedTimeframe ?? null,
                    minRating: parsedMinRating ?? null,
                    sortBy: sortBy || "combined",
                },
                count: trending.length,
                data: trending,
            });
        } catch (error: any) {
            console.error("Post trending products error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to calculate trending products",
            });
        }
    }
}

export default new ProductController();