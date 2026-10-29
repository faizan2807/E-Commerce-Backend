import { IProducts } from "../interfaces/IProduct"
import { PaginationOptions } from "../interfaces/IPagination"
import Product from "../models/Product"
import Favourite from "../models/Favourite"
import Order from "../models/Order"

class ProductRepository {
    // create products
    async createProduct(productData: Partial<IProducts>) {
        const product = await Product.create(productData);
        return product;
    }

    // get product with pagination, filtering & sorting
    async GetAllProducts(options: PaginationOptions = {}) {
        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.max(1, Math.min(1000, Number(options.limit) || 10));
        const skip = (page - 1) * limit;

        const query: any = {};
        if (options.search && options.search.trim()) {
            const regex = { $regex: options.search.trim(), $options: "i" };
            query.$or = [
                { title: regex },
                { brand: regex },
                { category: regex },
                { description: regex },
            ];
        }

        if (options.category && options.category.trim() && options.category.toLowerCase() !== "all") {
            query.category = { $regex: `^${options.category.trim()}$`, $options: "i" };
        }

        if (options.status && options.status.trim() && options.status.toLowerCase() !== "all") {
            query.status = options.status.trim();
        }

        const sortBy = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder === "asc" || options.sortOrder === 1 ? 1 : -1;
        const sortOptions: any = { [sortBy]: sortOrder };

        const [products, total] = await Promise.all([
            Product.find(query).sort(sortOptions).skip(skip).limit(limit),
            Product.countDocuments(query),
        ]);

        return {
            products,
            total,
            page,
            limit,
        };
    }

    // get productby search
    async GetProductBySearch(search: string) {
        return await Product.find({
            $or: [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    brand: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    category: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ],
        });
    }

    // get favourite products by userId
    async GetFavouriteProducts(userId: string) {
        const favs = await Favourite.find({ userId });
        if (favs.length === 0) return [];

        const productIds = favs.map((f) => f.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length > 0) {
            return products;
        }

        // Fallback: return favs with _id mapped to productId
        return favs.map((f) => {
            const obj = f.toObject();
            return {
                ...obj,
                _id: f.productId,
            };
        });
    }

    // post favourite products by userId (like cart)
    async postFavouriteProducts(productId: string, userId: string, explicitFavourite?: boolean) {
        const existingFav = await Favourite.findOne({ userId, productId });
        const isFavourite = explicitFavourite !== undefined ? explicitFavourite : !existingFav;

        if (isFavourite) {
            const product = await Product.findById(productId);
            if (product) {
                const favItem = await Favourite.findOneAndUpdate(
                    { userId, productId },
                    {
                        userId,
                        productId,
                        title: product.title,
                        description: product.description || "",
                        price: product.price,
                        category: product.category || "",
                        image: product.image || [],
                        rating: product.rating || { rate: 0, count: 0 },
                        brand: product.brand || "",
                    },
                    { upsert: true, returnDocument: "after" }
                );
                return { product: favItem, isFavourite: true };
            }
            return { product: null, isFavourite: false };
        } else {
            await Favourite.findOneAndDelete({ userId, productId });
            return { product: null, isFavourite: false };
        }
    }

    // batch sync favourite products for a user
    async syncFavourites(userId: string, productIds: string[]) {
        for (const productId of productIds) {
            if (!productId) continue;
            await this.postFavouriteProducts(productId, userId, true);
        }
        return await this.GetFavouriteProducts(userId);
    }

    // get productById
    async GetProductById(_Id: string) {
        return await Product.findById(_Id)
    }

    // get product by category
    async GetproductByCategory(category: string) {
        console.log("find by category", category)
        return await Product.find({ category })
    }

    // get dynamic trending products (no schema changes)
    async getDynamicTrendingProducts(options: {
        limit?: number;
        category?: string;
        timeframeDays?: number;
        minRating?: number;
        sortBy?: "orders" | "rating" | "combined";
    } = {}) {
        const limit = options.limit && options.limit > 0 ? options.limit : 8;
        const timeframeDays = options.timeframeDays;
        const category = options.category;
        const minRating = options.minRating || 0;
        const sortBy = options.sortBy || "combined";

        // 1. Calculate order counts per product
        const matchStage: any = {};
        if (timeframeDays && timeframeDays > 0) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeframeDays);
            matchStage.createdAt = { $gte: startDate };
        }

        const orderAgg = await Order.aggregate([
            { $match: matchStage },
            { $group: { _id: "$productId", orderCount: { $sum: 1 } } },
        ]);

        const orderCountMap: Record<string, number> = {};
        orderAgg.forEach((item: any) => {
            if (item._id) {
                orderCountMap[String(item._id)] = item.orderCount;
            }
        });

        // 2. Fetch candidate products
        const productFilter: any = { status: { $ne: "Out Of Stock" } };
        if (category && category.trim() !== "") {
            productFilter.category = category;
        }
        if (minRating > 0) {
            productFilter["rating.rate"] = { $gte: minRating };
        }

        const products = await Product.find(productFilter);

        // 3. Score and rank products dynamically
        const scoredProducts = products.map((prod: any) => {
            const prodObj = prod.toObject();
            const prodIdStr = String(prod._id);
            const orderCount = orderCountMap[prodIdStr] || 0;
            const rate = prodObj.rating?.rate || 0;
            const count = prodObj.rating?.count || 0;

            let score = 0;
            if (sortBy === "orders") {
                score = orderCount;
            } else if (sortBy === "rating") {
                score = rate * 10 + Math.log10(count + 1);
            } else {
                // "combined": order volume weighted + rating rate & count
                score = orderCount * 20 + rate * 5 + Math.log10(count + 1);
            }

            return {
                ...prodObj,
                trendMetrics: {
                    orderCount,
                    score: Number(score.toFixed(2)),
                },
            };
        });

        // Sort descending by calculated score, then by rating rate, then by createdAt
        scoredProducts.sort((a: any, b: any) => {
            if (b.trendMetrics.score !== a.trendMetrics.score) {
                return b.trendMetrics.score - a.trendMetrics.score;
            }
            const rateA = a.rating?.rate || 0;
            const rateB = b.rating?.rate || 0;
            if (rateB !== rateA) {
                return rateB - rateA;
            }
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        return scoredProducts.slice(0, limit);
    }

    // Update ProductById
    async UpdateProducts(_Id: string, productData: Partial<IProducts>) {
        return await Product.findByIdAndUpdate(_Id, productData, { returnDocument: "after" })
    }

    // Delete ProductById
    async DeleteProduct(_Id: string) {
        return await Product.findByIdAndDelete(_Id)
    }
}

export default new ProductRepository 