import Product from "../models/Product";
import Order from "../models/Order";

class DashboardRepository {
    // 1. Total Products Count
    async getTotalProductsCount(): Promise<number> {
        return await Product.countDocuments();
    }

    // 2. Out of Stock Count & List
    async getOutOfStockCount(): Promise<number> {
        return await Product.countDocuments({ status: "Out Of Stock" });
    }

    async getOutOfStockProducts() {
        return await Product.find({ status: "Out Of Stock" }).select(
            "title price category image brand status sellerId createdAt"
        );
    }

    // 3. Total Orders Count & Revenue
    async getTotalOrdersCount(): Promise<number> {
        return await Order.countDocuments();
    }

    async getTotalRevenue(): Promise<number> {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$price" },
                },
            },
        ]);
        return result.length > 0 ? result[0].totalRevenue : 0;
    }

    // 4. Metrics by Date Range (Orders count, Revenue, and New Products added)
    async getMetricsByDateRange(startDate?: Date, endDate?: Date) {
        const orderDateFilter: any = {};
        const productDateFilter: any = {};

        if (startDate && endDate) {
            orderDateFilter.createdAt = { $gte: startDate, $lt: endDate };
            productDateFilter.createdAt = { $gte: startDate, $lt: endDate };
        } else if (startDate) {
            orderDateFilter.createdAt = { $gte: startDate };
            productDateFilter.createdAt = { $gte: startDate };
        }

        const [orderStats, newProductsCount] = await Promise.all([
            Order.aggregate([
                { $match: orderDateFilter },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$price" },
                    },
                },
            ]),
            Product.countDocuments(productDateFilter),
        ]);

        return {
            totalOrders: orderStats.length > 0 ? orderStats[0].totalOrders : 0,
            totalRevenue: orderStats.length > 0 ? orderStats[0].totalRevenue : 0,
            newProductsAdded: newProductsCount,
        };
    }
}

export default new DashboardRepository();
