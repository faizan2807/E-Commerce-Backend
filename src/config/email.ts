import nodemailer from "nodemailer";
import env from "./env";

export const emailTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true for 465, false for other ports like 587
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const verifyEmailConnection = async (): Promise<boolean> => {
    try {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn("⚠️ SMTP credentials not fully configured. Email sending will be skipped or simulated.");
            return false;
        }
        await emailTransporter.verify();
        console.log("✅ Email SMTP transporter verified successfully.");
        return true;
    } catch (error) {
        console.error("❌ Email SMTP connection failed:", error);
        return false;
    }
};

export default emailTransporter;
