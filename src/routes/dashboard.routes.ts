import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller";




const DashbooardRoutes = Router();

DashbooardRoutes.get("/", dashboardController.getDashboardData);

export default DashbooardRoutes;   