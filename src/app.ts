import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import Productroutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes"
import path from "path";
import dashboardRoutes from "./routes/dashboard.routes";
import cartRoutes from "./routes/cart.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);
app.use(
    "/images",
    express.static(path.join(process.cwd(), "public", "images"))
);

app.use("/api/users", userRoutes);
app.use("/api/product", Productroutes);
app.use("/api/order", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);

export default app;