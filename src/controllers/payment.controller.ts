import { Request, Response } from "express";
import paymentService from "../services/payment.service";
import env from "../config/env";
import Product from "../models/Product";

const toStringOrUndefined = (val: unknown): string | undefined => {
    if (typeof val === "string") return val;
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
    return undefined;
};

class PaymentController {
    // 1. Get Public Razorpay Key ID
    getKey(req: Request, res: Response): void {
        res.status(200).json({
            success: true,
            key: env.RAZORPAY_KEY_ID,
        });
    }

    // 2. Create Razorpay Order
    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const { productId, currency = "INR", receipt, notes } = req.body;
            let { amount } = req.body;

            // If amount not provided but productId is, retrieve price from DB to prevent tampering
            if ((!amount || Number(amount) <= 0) && productId) {
                const product = await Product.findById(productId);
                if (!product) {
                    res.status(404).json({
                        success: false,
                        message: "Product not found",
                    });
                    return;
                }
                amount = product.price;
            }

            if (!amount || Number(amount) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "Valid order amount is required",
                });
                return;
            }

            const razorpayOrder = await paymentService.createRazorpayOrder({
                amount: Number(amount),
                currency,
                receipt: receipt || `rcpt_${Date.now()}`,
                notes: notes || (productId ? { productId } : {}),
            });

            res.status(200).json({
                success: true,
                message: "Razorpay order initiated successfully",
                data: razorpayOrder,
            });
        } catch (error: any) {
            console.error("Create Razorpay Order Error:", error);
            const errorMessage =
                error?.error?.description ||
                error?.description ||
                error?.message ||
                "Failed to initiate Razorpay order";
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    // 3. Verify Payment & Confirm Order
    async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const userId = toStringOrUndefined(req.user?.id || req.body.userId);
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                productId,
                price,
                shipping,
            } = req.body;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                res.status(400).json({
                    success: false,
                    message: "Razorpay payment details (order_id, payment_id, signature) are required",
                });
                return;
            }

            if (!productId || price === undefined) {
                res.status(400).json({
                    success: false,
                    message: "Product ID and price are required to create the order",
                });
                return;
            }

            const result = await paymentService.verifyAndCreateOrder({
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                orderData: {
                    productId,
                    price: Number(price),
                    shipping: shipping || "Standard",
                    paymentMethod: "Razorpay",
                },
            });

            res.status(200).json({
                success: true,
                message: "Payment verified and order placed successfully",
                data: result,
            });
        } catch (error: any) {
            console.error("Payment Verification Error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Payment verification failed",
            });
        }
    }

    // 4. Razorpay Webhook Handler (Optional asynchronous events)
    async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            const signature = req.headers["x-razorpay-signature"] as string;
            if (!signature) {
                res.status(400).json({ success: false, message: "Webhook signature missing" });
                return;
            }

            const rawBody = JSON.stringify(req.body);
            const isValid = paymentService.verifyWebhookSignature(rawBody, signature);

            if (!isValid) {
                res.status(400).json({ success: false, message: "Invalid webhook signature" });
                return;
            }

            const event = req.body.event;
            console.log(`[Razorpay Webhook Received] Event: ${event}`);

            // Acknowledge receipt to Razorpay
            res.status(200).json({ status: "ok" });
        } catch (error: any) {
            console.error("Webhook processing error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new PaymentController();
