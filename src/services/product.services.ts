import { IProducts } from "../interfaces/IProduct";
import { PaginationOptions, PaginatedResponse } from "../interfaces/IPagination";
import ProductRepository from "../repositories/product.repository"

class ProductService {
    //CREATE PRODUCT
    async createProduct(productData: Partial<IProducts>) {
        return await ProductRepository.createProduct(productData);
    }
    // Get Product with pagination metadata
    async GetAllProducts(options: PaginationOptions = {}): Promise<PaginatedResponse<IProducts>> {
        const result = await ProductRepository.GetAllProducts(options);
        const totalPages = Math.ceil(result.total / result.limit) || 1;

        return {
            data: result.products as unknown as IProducts[],
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages,
                hasNextPage: result.page < totalPages,
                hasPrevPage: result.page > 1,
            },
        };
    }

    //get productBysearch
    async GetProductBySearch(search: string) {
        return await ProductRepository.GetProductBySearch(search)
    }

    //Get ProductById
    async GetProductById(_id: string) {
        return await ProductRepository.GetProductById(_id)
    }

    // get favourite products
    async GetFavouriteProducts(userId: string) {
        try {
            return await ProductRepository.GetFavouriteProducts(userId);
        } catch (error) {
            console.error("Service Error:", error);
            throw error;
        }
    }

    // post favourite products
    async postFavouriteProducts(productId: string, userId: string, explicitFavourite?: boolean) {
        return await ProductRepository.postFavouriteProducts(productId, userId, explicitFavourite);
    }

    // batch sync favourite products
    async syncFavourites(userId: string, productIds: string[]) {
        return await ProductRepository.syncFavourites(userId, productIds);
    }

    //  get product By Category
    async GetProductByCategory(category: string) {
        return await ProductRepository.GetproductByCategory(category)
    }

    // Update Product
    async UpdateProducts(_id: string, ProductData: Partial<IProducts>) {
        return await ProductRepository.UpdateProducts(_id, ProductData)
    }

    // Get Trending Products
    async GetTrendingProducts(limit?: number, category?: string) {
        return await ProductRepository.getDynamicTrendingProducts({
            limit,
            category,
            sortBy: "combined",
        });
    }

    // Calculate Dynamic Trending Products with custom criteria
    async CalculateDynamicTrending(criteria: {
        limit?: number;
        category?: string;
        timeframeDays?: number;
        minRating?: number;
        sortBy?: "orders" | "rating" | "combined";
    }) {
        return await ProductRepository.getDynamicTrendingProducts(criteria);
    }

    // Delete Product
    async DeleteProduct(_id: string) {
        return await ProductRepository.DeleteProduct(_id)
    }
}
export default new ProductService;