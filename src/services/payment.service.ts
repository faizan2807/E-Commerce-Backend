import crypto from "crypto";
import getRazorpayInstance from "../config/razorpay";
import env from "../config/env";
import orderServices from "./order.services";
import emailService from "./email.service";
import User from "../models/User";
import Product from "../models/Product";

export interface ICreateRazorpayOrderParams {
    amount: number; // In rupees
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
}

export interface IVerifyPaymentParams {
    userId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderData: {
        productId: string;
        price: number;
        shipping?: string;
        paymentMethod?: string;
    };
}

class PaymentService {
    // 1. Create Order on Razorpay
    async createRazorpayOrder(params: ICreateRazorpayOrderParams) {
        const { amount, currency = "INR", receipt, notes } = params;

        if (!amount || amount <= 0) {
            throw new Error("Invalid order amount");
        }

        const razorpay = getRazorpayInstance();

        // Ensure notes are string key-value pairs (Razorpay requires strings)
        const sanitizedNotes: Record<string, string> = {};
        if (notes && typeof notes === "object") {
            for (const [key, value] of Object.entries(notes)) {
                sanitizedNotes[key] = String(value);
            }
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay accepts amounts in paise
            currency,
            receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
            notes: sanitizedNotes,
        };

        const razorpayOrder = await razorpay.orders.create(options);
        return razorpayOrder;
    }

    // 2. Cryptographic Verification of Razorpay Signature
    verifySignature(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ): boolean {
        if (!env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay key secret is not configured on the server");
        }

        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        return expectedSignature === razorpaySignature;
    }

    // 3. Complete Verification, Order Creation, and Email Notification
    async verifyAndCreateOrder(params: IVerifyPaymentParams) {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = params;

        // Verify HMAC SHA256 signature
        const isValid = this.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
            throw new Error("Payment signature verification failed. Transaction cannot be trusted.");
        }

        // Place Order using existing OrderService without any schema alterations
        const createdOrder = await orderServices.postOrderByUserId(userId, {
            productId: orderData.productId,
            price: Number(orderData.price),
            paymentMethod: "Razorpay",
            status: "Placed",
            shipping: orderData.shipping || "Standard",
        });

        // Asynchronously retrieve user and product info to send confirmation email
        this.sendConfirmationAsync(userId, createdOrder, orderData.productId).catch((err) =>
            console.error("Async confirmation email error:", err)
        );

        return {
            order: createdOrder,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
        };
    }

    // Helper: Async fetch details & send email (Isolated)
    private async sendConfirmationAsync(userId: string, order: any, productId: string) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.email) return;

            let productTitle = "Product";
            if (productId) {
                const product = await Product.findById(productId);
                if (product && product.title) {
                    productTitle = product.title;
                }
            }

            await emailService.sendOrderConfirmationEmail(user.email, {
                orderId: order._id ? order._id.toString() : "N/A",
                productTitle,
                price: order.price,
                paymentMethod: order.paymentMethod || "Razorpay",
                shipping: order.shipping || "Standard",
                status: order.status || "Placed",
                customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
            });
        } catch (error) {
            console.error("Failed to send order confirmation email:", error);
        }
    }

    // 4. Webhook Signature Verification
    verifyWebhookSignature(rawBody: string, signature: string): boolean {
        if (!env.RAZORPAY_WEBHOOK_SECRET) {
            throw new Error("Razorpay webhook secret not configured");
        }

        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");

        return expectedSignature === signature;
    }
}

export default new PaymentService();
