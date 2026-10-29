import dashboardServices from "../services/dashboard.services";
import { Request, Response } from "express";

class DashbordController {
    async getDashboardData(req: Request, res: Response) {
        try {
            const data = await dashboardServices.getDashboardStats();
            res.status(200).json({
                success: true,
                message: "Dashboard data fetched successfully",
                data,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}
export default new DashbordController();