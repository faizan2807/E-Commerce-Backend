import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate } from "../middlerware/auth.middleware";

const orderRoutes = Router();

// GET orders by userId (all orders or a specific order by orderId)
orderRoutes.get("/",orderController.getOrder);   
orderRoutes.get("/:userId", authenticate, orderController.getOrderByUserId);
orderRoutes.get("/:userId/:orderId", authenticate, orderController.getOrderByUserId);

// POST create order by userId
orderRoutes.post("/:userId", authenticate, orderController.postOrderByUserId);

// PUT full update of order by userId and orderId
orderRoutes.put("/:userId/:orderId", authenticate, orderController.putOrderByUserId);

// Admin or direct status/order update routes
orderRoutes.patch("/status/:orderId", orderController.UpdateOrder);
orderRoutes.put("/status/:orderId", orderController.UpdateOrder);
orderRoutes.patch("/:orderId", orderController.UpdateOrder);
orderRoutes.put("/:orderId", orderController.UpdateOrder);
// DELETE order by userId and orderId
orderRoutes.delete("/:userId/:orderId", authenticate, orderController.deleteOrderByUserId);

export default orderRoutes;