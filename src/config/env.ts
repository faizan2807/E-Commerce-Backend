import path from "path";
import dotenv from "dotenv";

const envFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../../.env"),
];

for (const envFile of envFiles) {
  dotenv.config({ path: envFile });
}

const env = {
  PORT: process.env.PORT || "5000",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || '"Store Support" <no-reply@yourstore.com>',
};

export default env;