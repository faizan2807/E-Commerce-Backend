import { IOrder } from "../interfaces/IOrder";
import { PaginationOptions } from "../interfaces/IPagination";
import Order from "../models/Order";

class OrderRepository {
    
    async getOrder(options: PaginationOptions = {}){
        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.max(1, Math.min(1000, Number(options.limit) || 10));
        const skip = (page - 1) * limit;

        const query: any = {};
        if (options.status && options.status.trim() && options.status.toLowerCase() !== "all") {
            query.status = { $regex: `^${options.status.trim()}$`, $options: "i" };
        }

        if (options.search && options.search.trim()) {
            const term = options.search.trim();
            const regex = { $regex: term, $options: "i" };
            const orConditions: any[] = [
                { userId: regex },
                { paymentMethod: regex },
                { status: regex },
                { shipping: regex },
            ];
            // If the search string is a valid MongoDB ObjectId (24 hex characters), also search _id
            if (/^[0-9a-fA-F]{24}$/.test(term)) {
                orConditions.push({ _id: term });
            }
            query.$or = orConditions;
        }

        const sortBy = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder === "asc" || options.sortOrder === 1 ? 1 : -1;
        const sortOptions: any = { [sortBy]: sortOrder };

        const [orders, total] = await Promise.all([
            Order.find(query).sort(sortOptions).skip(skip).limit(limit),
            Order.countDocuments(query),
        ]);

        return {
            orders,
            total,
            page,
            limit,
        };
    }

    async UpdateOrder(orderId: string, updateData: Partial<IOrder>) {
        return await Order.findByIdAndUpdate(orderId, updateData, {
            returnDocument: "after",
            runValidators: true,
        });
    }

    async getOrderByUserId(userId: string, orderId?: string) {
        if (orderId) {
            return await Order.findOne({ _id: orderId, userId });
        }
        return await Order.find({ userId }).sort({ createdAt: -1 });
    }

    async postOrderByUserId(userId: string, orderData: Partial<IOrder>) {
        return await Order.create({
            ...orderData,
            userId,
        });
    }

    async putOrderByUserId(userId: string, orderId: string, orderData: Partial<IOrder>) {
        const filter = orderId ? { _id: orderId, userId } : { userId };
        return await Order.findOneAndUpdate(filter, orderData, {
            returnDocument: "after",
            runValidators: true,
        });
    }

    async patchOrderByUserId(userId: string, orderId: string, updateData: Partial<IOrder>) {
        const filter = orderId ? { _id: orderId, userId } : { userId };
        return await Order.findOneAndUpdate(
            filter,
            { $set: updateData },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );
    }

    async deleteOrderByUserId(userId: string, orderId?: string) {
        if (orderId) {
            return await Order.findOneAndDelete({ _id: orderId, userId });
        }
        return await Order.deleteMany({ userId });
    }

    // Exact name aliases to support user-specified casing
    getOrderbyUserId = this.getOrderByUserId.bind(this);
    PostOrderByUserId = this.postOrderByUserId.bind(this);
    PutorderByuserId = this.putOrderByUserId.bind(this);
    patchOrderbyUserId = this.patchOrderByUserId.bind(this);
    DeleteOrderbyUserId = this.deleteOrderByUserId.bind(this);
}

export default new OrderRepository();