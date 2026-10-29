import dashboardRepository from "../repositories/dashboard.repository";

class DashboardService {
    async getDashboardStats() {
        const now = new Date();
        const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const days15Ago = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const days180Ago = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        const days365Ago = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        // Fetch all metrics concurrently for optimal performance
        const [
            totalProducts,
            outOfStockCount,
            outOfStockProducts,
            totalOrders,
            totalRevenue,
            last0To7Days,
            last7To15Days,
            last15To30Days,
            last30to180Days,
            last180to365Days,
        ] = await Promise.all([
            dashboardRepository.getTotalProductsCount(),
            dashboardRepository.getOutOfStockCount(),
            dashboardRepository.getOutOfStockProducts(),
            dashboardRepository.getTotalOrdersCount(),
            dashboardRepository.getTotalRevenue(),
            dashboardRepository.getMetricsByDateRange(days7Ago, now),
            dashboardRepository.getMetricsByDateRange(days15Ago, days7Ago),
            dashboardRepository.getMetricsByDateRange(days30Ago, days15Ago),
            dashboardRepository.getMetricsByDateRange(days180Ago, days30Ago),
            dashboardRepository.getMetricsByDateRange(days365Ago, days180Ago),
        ]);

        return {
            summary: {
                totalProducts,
                totalOrders,
                totalRevenue,
                outOfStockCount,
            },
            outOfStockProducts,
            timelineAnalytics: {
                last0To7Days: {
                    period: "Last 0 to 7 days",
                    ordersCount: last0To7Days.totalOrders,
                    revenue: last0To7Days.totalRevenue,
                    newProductsAdded: last0To7Days.newProductsAdded,
                },
                last7To15Days: {
                    period: "Previous 7 to 15 days",
                    ordersCount: last7To15Days.totalOrders,
                    revenue: last7To15Days.totalRevenue,
                    newProductsAdded: last7To15Days.newProductsAdded,
                },
                last15To30Days: {
                    period: "Previous 15 to 30 days",
                    ordersCount: last15To30Days.totalOrders,
                    revenue: last15To30Days.totalRevenue,
                    newProductsAdded: last15To30Days.newProductsAdded,
                },
                last30to180Days: {
                    period: "Previous 30 to 180 days",
                    ordersCount: last30to180Days.totalOrders,
                    revenue: last30to180Days.totalRevenue,
                    newProductsAdded: last30to180Days.newProductsAdded,
                },
                last180to365Days: {
                    period: "Previous 180 to 365 days",
                    ordersCount: last180to365Days.totalOrders,
                    revenue: last180to365Days.totalRevenue,
                    newProductsAdded: last180to365Days.newProductsAdded,
                },
            },
        };
    }
}

export default new DashboardService();
