import emailTransporter from "../config/email";
import env from "../config/env";

export interface IEmailOrderDetails {
    orderId: string;
    productTitle?: string;
    price: number;
    paymentMethod: string;
    shipping: string;
    status: string;
    customerName?: string;
}

class EmailService {
    private from = env.EMAIL_FROM;

    private async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
        try {
            if (!env.SMTP_USER || !env.SMTP_PASS) {
                console.log(`[Email Simulation] To: ${to} | Subject: "${subject}"`);
                return true;
            }

            const info = await emailTransporter.sendMail({
                from: this.from,
                to,
                subject,
                text: text || subject,
                html,
            });

            console.log(`[Email Sent] MessageId: ${info.messageId} to ${to}`);
            return true;
        } catch (error) {
            console.error(`[Email Error] Failed to send email to ${to}:`, error);
            return false;
        }
    }

    // 1. Welcome Email on User Registration
    async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        const subject = "Welcome to Our Store! 🎉";
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Welcome, ${name}!</h2>
            <p style="font-size: 16px; color: #374151;">
                We are thrilled to have you join our community. Your account has been created successfully.
            </p>
            <p style="font-size: 15px; color: #4B5563;">
                Explore our catalog, discover the latest products, and enjoy a seamless shopping experience.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Start Shopping
                </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
                If you did not create this account, please ignore this email or contact customer support.
            </p>
        </div>
        `;
        return this.sendMail(to, subject, html);
    }

    // 2. Order Confirmation & Payment Success Email
    async sendOrderConfirmationEmail(to: string, details: IEmailOrderDetails): Promise<boolean> {
        const subject = `Order Confirmed #${details.orderId.slice(-8)} - Payment Successful`;
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="background-color: #DEF7EC; color: #03543F; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                    Order Confirmed & Paid
                </span>
            </div>
            <h2 style="color: #111827; text-align: center; margin-top: 10px;">Thank you for your order!</h2>
            <p style="font-size: 15px; color: #4B5563; text-align: center;">
                Hi ${details.customerName || "Customer"}, your payment has been processed and your order is placed.
            </p>

            <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="font-size: 15px; color: #374151; margin-top: 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Order Summary</h3>
                <p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Order ID:</strong> ${details.orderId}</p>
                ${details.productTitle ? `<p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Product:</strong> ${details.productTitle}</p>` : ""}
                <p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Payment Method:</strong> ${details.paymentMethod}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Shipping Option:</strong> ${details.shipping}</p>
                <p style="margin: 6px 0; font-size: 16px; color: #111827;"><strong>Total Paid:</strong> ₹${details.price.toFixed(2)}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #047857;"><strong>Status:</strong> ${details.status}</p>
            </div>

            <p style="font-size: 14px; color: #4B5563;">
                We will notify you via email as soon as your items are packed and shipped.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
                Need help with your order? Reply to this email or visit our help center.
            </p>
        </div>
        `;
        return this.sendMail(to, subject, html);
    }

    // 3. Order Status Lifecycle Email (Placed, Shipped, Delivered, Cancelled)
    async sendOrderStatusEmail(to: string, details: IEmailOrderDetails, newStatus: string): Promise<boolean> {
        let badgeColor = "#E0E7FF";
        let textColor = "#3730A3";
        let statusDescription = `Your order status has been updated to: <strong>${newStatus}</strong>.`;

        const normalizedStatus = newStatus.toLowerCase();

        if (normalizedStatus.includes("shipped")) {
            badgeColor = "#DBEAFE";
            textColor = "#1E40AF";
            statusDescription = "Great news! Your package has been dispatched and is on its way to you.";
        } else if (normalizedStatus.includes("deliver")) {
            badgeColor = "#D1FAE5";
            textColor = "#065F46";
            statusDescription = "Your package has been safely delivered! We hope you love your purchase.";
        } else if (normalizedStatus.includes("cancel")) {
            badgeColor = "#FEE2E2";
            textColor = "#991B1B";
            statusDescription = "Your order has been cancelled. If payment was deducted, your refund will be processed back to your original payment method.";
        }

        const subject = `Update on Order #${details.orderId.slice(-8)}: ${newStatus}`;
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="background-color: ${badgeColor}; color: ${textColor}; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                    Order ${newStatus}
                </span>
            </div>
            <h2 style="color: #111827; text-align: center;">Order Status Update</h2>
            <p style="font-size: 15px; color: #4B5563; text-align: center;">
                ${statusDescription}
            </p>

            <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="font-size: 15px; color: #374151; margin-top: 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Order Details</h3>
                <p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Order ID:</strong> ${details.orderId}</p>
                ${details.productTitle ? `<p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Product:</strong> ${details.productTitle}</p>` : ""}
                <p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Shipping Option:</strong> ${details.shipping}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #4B5563;"><strong>Total Amount:</strong> ₹${details.price.toFixed(2)}</p>
                <p style="margin: 6px 0; font-size: 14px; color: ${textColor};"><strong>Current Status:</strong> ${newStatus}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
                Thank you for shopping with us. For inquiries, reply to this email.
            </p>
        </div>
        `;

        return this.sendMail(to, subject, html);
    }
}

export default new EmailService();
