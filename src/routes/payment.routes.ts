import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import { authenticate } from "../middlerware/auth.middleware";

const paymentRoutes = Router();

// 1. Get Razorpay Public Key ID
paymentRoutes.get("/key", paymentController.getKey);

// 2. Create Razorpay Order
paymentRoutes.post("/create-order", authenticate, paymentController.createOrder);

// 3. Verify Payment & Create Order
paymentRoutes.post("/verify", authenticate, paymentController.verifyPayment);

// 4. Webhook handler
paymentRoutes.post("/webhook", paymentController.handleWebhook);

export default paymentRoutes;
