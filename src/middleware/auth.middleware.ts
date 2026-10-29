import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../interfaces/IUser";
import { AuthUserPayload } from "../types/express";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "default_jwt_secret";
        const decoded = jwt.verify(token, secret) as AuthUserPayload;

        req.user = decoded;
        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
        return;
    }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated.",
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: You do not have permission to perform this action. Required role: [${allowedRoles.join(", ")}]`,
            });
            return;
        }

        next();
    };
};
