import { Request, Response } from "express";
import orderServices from "../services/order.services";
import emailService from "../services/email.service";
import User from "../models/User";
import Product from "../models/Product";

const toStringOrUndefined = (val: unknown): string | undefined => {
    if (typeof val === "string") return val;
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
    return undefined;
};

// Helper: Asynchronously notify customer of order placement
const notifyOrderConfirmation = async (userId: string, order: any) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.email) return;

        let productTitle = "Product";
        if (order.productId) {
            const product = await Product.findById(order.productId);
            if (product && product.title) productTitle = product.title;
        }

        await emailService.sendOrderConfirmationEmail(user.email, {
            orderId: order._id ? order._id.toString() : "N/A",
            productTitle,
            price: order.price,
            paymentMethod: order.paymentMethod || "Cash on Delivery",
            shipping: order.shipping || "Standard",
            status: order.status || "Placed",
            customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
        });
    } catch (err) {
        console.error("Order confirmation email error:", err);
    }
};

// Helper: Asynchronously notify customer of order status change (Placed, Processing, Shipped, Delivered, Cancelled)
const notifyOrderStatusChange = async (
    userId: string,
    order: any,
    newStatus: string,
    extraHints?: { userEmail?: string; customerName?: string }
) => {
    try {
        let user: any = null;
        if (userId) {
            if (/^[0-9a-fA-F]{24}$/.test(userId)) {
                user = await User.findById(userId);
            }
            if (!user) {
                const isNumeric = /^\d+$/.test(userId);
                if (isNumeric) {
                    user = await User.findOne({
                        $or: [{ contact: Number(userId) }, { email: userId }],
                    });
                } else {
                    user = await User.findOne({ email: userId });
                }
            }
        }

        const targetEmail =
            extraHints?.userEmail ||
            user?.email ||
            order?.userEmail ||
            order?.email ||
            (typeof userId === "string" && userId.includes("@") ? userId : undefined);

        if (!targetEmail) {
            console.warn(`[Order Status Email] No email found for userId: "${userId}" on order: "${order?._id}"`);
            return;
        }

        let customerName =
            extraHints?.customerName ||
            order?.customerName ||
            order?.userName;

        if (!customerName && user) {
            customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined;
        }

        let productTitle = order?.productTitle || "Product";
        if (order?.productId) {
            const product = await Product.findById(order.productId);
            if (product && product.title) productTitle = product.title;
        } else if (Array.isArray(order?.items) && order.items.length > 0) {
            productTitle = order.items.map((i: any) => i.title || i.name).filter(Boolean).join(", ");
        }

        await emailService.sendOrderStatusEmail(
            targetEmail,
            {
                orderId: order?._id ? order._id.toString() : "N/A",
                productTitle,
                price: Number(order?.price) || 0,
                paymentMethod: order?.paymentMethod || "N/A",
                shipping: order?.shipping || "Standard",
                status: newStatus,
                customerName: customerName || "Customer",
            },
            newStatus
        );
        console.log(`[Order Status Email] Dispatched to ${targetEmail} for Order #${order?._id} with status "${newStatus}"`);
    } catch (err) {
        console.error("Order status update email error:", err);
    }
};

class OrderController {


    async getOrder(req: Request, res: Response): Promise<void> {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit as string) || 10));
            const status = req.query.status as string;
            const search = req.query.search as string;
            const sortBy = req.query.sortBy as string;
            const sortOrder = req.query.sortOrder as "asc" | "desc";

            const result = await orderServices.getOrder({
                page,
                limit,
                status,
                search,
                sortBy,
                sortOrder,
            });

            res.status(200).json({
                success: true,
                message: "Orders fetched successfully",
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error: any) {
            console.error("Get orders error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async UpdateOrder(req: Request, res: Response): Promise<void> {
        try {
            const orderId = toStringOrUndefined(req.params.orderId || req.params._id || req.body.orderId || req.body._id);
            const updateData = req.body;

            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: "Order ID is required",
                });
                return;
            }

            const updatedOrder = await orderServices.UpdateOrder(orderId, updateData);

            if (!updatedOrder) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            // Asynchronously dispatch notification email to customer if status is updated
            if (updateData.status) {
                notifyOrderStatusChange(
                    updatedOrder.userId,
                    updatedOrder,
                    updateData.status,
                    {
                        userEmail: updateData.userEmail || updateData.email,
                        customerName: updateData.customerName || updateData.userName,
                    }
                );
            }

            res.status(200).json({
                success: true,
                message: "Order updated successfully",
                data: updatedOrder,
            });
        } catch (error: any) {
            console.error("Update order error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update order",
            });
        }
    }   

    // 1. GET order(s) by userId
    async getOrderByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = toStringOrUndefined(req.user?.id || req.params.userId || req.query.userId || req.body.userId);
            const orderId = toStringOrUndefined(req.params.orderId || req.params._id || req.query.orderId || req.query._id);

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const orders = await orderServices.getOrderByUserId(userId, orderId);

            if (!orders || (Array.isArray(orders) && orders.length === 0)) {
                res.status(404).json({
                    success: false,
                    message: "No orders found for this user",
                    data: [],
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Orders fetched successfully",
                data: orders,
            });
        } catch (error: any) {
            console.error("Get orders by userId error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    // 2. POST order by userId
    async postOrderByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = toStringOrUndefined(req.user?.id || req.params.userId || req.body.userId);

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const { productId, paymentMethod, status, shipping, price } = req.body;

            if (!productId || price === undefined) {
                res.status(400).json({
                    success: false,
                    message: "Product ID and price are required",
                });
                return;
            }

            const orderData = {
                userId,
                productId,
                paymentMethod: paymentMethod || "Cash on Delivery",
                status: status || "Pending",
                shipping: shipping || "Standard",
                price: Number(price),
            };

            const createdOrder = await orderServices.postOrderByUserId(userId, orderData);

            // Asynchronously dispatch confirmation email
            notifyOrderConfirmation(userId, createdOrder);

            res.status(201).json({
                success: true,
                message: "Order placed successfully",
                data: createdOrder,
            });
        } catch (error: any) {
            console.error("Post order by userId error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to place order",
            });
        }
    }

    // 3. PUT order by userId (complete update)
    async putOrderByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = toStringOrUndefined(req.user?.id || req.params.userId || req.body.userId);
            const orderId = toStringOrUndefined(req.params.orderId || req.params._id || req.body.orderId || req.body._id);

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: "Order ID is required",
                });
                return;
            }

            const updatedOrder = await orderServices.putOrderByUserId(userId, orderId, req.body);

            if (!updatedOrder) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            // Asynchronously notify if status was updated
            if (req.body.status) {
                notifyOrderStatusChange(userId, updatedOrder, req.body.status, {
                    userEmail: req.body.userEmail || req.body.email,
                    customerName: req.body.customerName || req.body.userName,
                });
            }

            res.status(200).json({
                success: true,
                message: "Order updated successfully",
                data: updatedOrder,
            });
        } catch (error: any) {
            console.error("Put order by userId error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update order",
            });
        }
    }

    // 4. PATCH order by userId (partial update)
    async patchOrderByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = toStringOrUndefined(req.user?.id || req.params.userId || req.body.userId);
            const orderId = toStringOrUndefined(req.params.orderId || req.params._id || req.body.orderId || req.body._id);

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: "Order ID is required",
                });
                return;
            }

            const patchedOrder = await orderServices.patchOrderByUserId(userId, orderId, req.body);

            if (!patchedOrder) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            // Asynchronously notify if status was updated
            if (req.body.status) {
                notifyOrderStatusChange(userId, patchedOrder, req.body.status, {
                    userEmail: req.body.userEmail || req.body.email,
                    customerName: req.body.customerName || req.body.userName,
                });
            }

            res.status(200).json({
                success: true,
                message: "Order updated successfully",
                data: patchedOrder,
            });
        } catch (error: any) {
            console.error("Patch order by userId error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update order",
            });
        }
    }

    // 5. DELETE order by userId
    async deleteOrderByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = toStringOrUndefined(req.user?.id || req.params.userId || req.body.userId);
            const orderId = toStringOrUndefined(
                req.params.orderId || req.params._id || req.query.orderId || req.query._id || req.body.orderId || req.body._id
            );

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const deletedOrder = await orderServices.deleteOrderByUserId(userId, orderId);

            if (!deletedOrder) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            // Asynchronously send cancellation email if single order was deleted
            if (deletedOrder && typeof deletedOrder === "object" && !Array.isArray(deletedOrder)) {
                notifyOrderStatusChange(userId, deletedOrder, "Cancelled");
            }

            res.status(200).json({
                success: true,
                message: "Order deleted successfully",
                data: deletedOrder,
            });
        } catch (error: any) {
            console.error("Delete order by userId error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to delete order",
            });
        }
    }

    // Exact name aliases to support user-specified casing
    getOrderbyUserId = this.getOrderByUserId.bind(this);
    PostOrderByUserId = this.postOrderByUserId.bind(this);
    PutorderByuserId = this.putOrderByUserId.bind(this);
    patchOrderbyUserId = this.patchOrderByUserId.bind(this);
    DeleteOrderbyUserId = this.deleteOrderByUserId.bind(this);
}

export default new OrderController();