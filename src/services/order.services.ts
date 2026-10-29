import { IOrder } from "../interfaces/IOrder";
import { PaginationOptions, PaginatedResponse } from "../interfaces/IPagination";
import orderRepository from "../repositories/order.respository";

class OrderService {

    async getOrder(options: PaginationOptions = {}): Promise<PaginatedResponse<IOrder>> {
        const result = await orderRepository.getOrder(options);
        const totalPages = Math.ceil(result.total / result.limit) || 1;

        return {
            data: result.orders as unknown as IOrder[],
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
    
    async UpdateOrder(orderId: string, updateData: Partial<IOrder>) {
        return await orderRepository.UpdateOrder(orderId, updateData);
    }

    // 1. Get orders by userId
    async getOrderByUserId(userId: string, orderId?: string) {
        return await orderRepository.getOrderByUserId(userId, orderId);
    }

    // 2. Post / Create order by userId
    async postOrderByUserId(userId: string, orderData: Partial<IOrder>) {
        return await orderRepository.postOrderByUserId(userId, orderData);
    }

    // 3. Complete update (PUT) order by userId
    async putOrderByUserId(userId: string, orderId: string, orderData: Partial<IOrder>) {
        return await orderRepository.putOrderByUserId(userId, orderId, orderData);
    }

    // 4. Partial update (PATCH) order by userId
    async patchOrderByUserId(userId: string, orderId: string, updateData: Partial<IOrder>) {
        return await orderRepository.patchOrderByUserId(userId, orderId, updateData);
    }

    // 5. Delete order by userId
    async deleteOrderByUserId(userId: string, orderId?: string) {
        return await orderRepository.deleteOrderByUserId(userId, orderId);
    }

    // Exact name aliases to support user-specified casing
    getOrderbyUserId = this.getOrderByUserId.bind(this);
    PostOrderByUserId = this.postOrderByUserId.bind(this);
    PutorderByuserId = this.putOrderByUserId.bind(this);
    patchOrderbyUserId = this.patchOrderByUserId.bind(this);
    DeleteOrderbyUserId = this.deleteOrderByUserId.bind(this);
}

export default new OrderService();