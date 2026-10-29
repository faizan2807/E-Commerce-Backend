import Razorpay from "razorpay";
import env from "./env";

export const getRazorpayInstance = () => {
    const key_id = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
    const key_secret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "";

    if (!key_id || !key_secret || key_id.includes("your_key_id") || key_secret.includes("your_razorpay_key_secret")) {
        throw new Error(
            "Razorpay API keys are not configured. Please add your real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the .env file."
        );
    }

    return new Razorpay({
        key_id,
        key_secret,
    });
};

export default getRazorpayInstance;

