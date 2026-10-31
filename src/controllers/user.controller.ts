import { Request, Response } from "express";
import UserService from "../services/user.services";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userServices from "../services/user.services";
import emailService from "../services/email.service";

class UserController {

    // login 
    async login(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserService.login(req.body);

            // Access Token
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: "15m",
                }
            );

            // // Refresh Token
            const refreshToken = jwt.sign(
                {
                    id: user._id,
                },
                process.env.JWT_REFRESH_SECRET!,
                {
                    expiresIn: "7d",
                }
            );

            // Save Refresh Token in DB
            await UserService.updateTokens(
                user._id.toString(),
                token,
                refreshToken
            );

            res.status(200).json({
                success: true,
                message: "User login successful",
                token,
                refreshToken,
                data: user,
            });

        } catch (err: any) {
            res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
    // Create User
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            req.body.password = hashedPassword;
            req.body.role = "Admin";

            const user = await UserService.createUser(req.body);

            // Send Welcome Email asynchronously
            if (user && user.email) {
                emailService
                    .sendWelcomeEmail(user.email, user.firstName || "Admin")
                    .catch((err) => console.error("Welcome email error:", err));
            }

            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get All Users
    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsers();

            res.status(200).json({
                success: true,
                count: users.length,
                data: users,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get User By ID
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { _id } = req.params;
            const userId: string = Array.isArray(_id) ? _id[0] : _id;

            const user = await UserService.getUserById(userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Update User
    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { _id } = req.params;
            const userId: string = Array.isArray(_id) ? _id[0] : _id;
            const updatedUser = await UserService.updateUser(userId, req.body);

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: updatedUser,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Delete User
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { _id } = req.params;
            const userId: string = Array.isArray(_id) ? _id[0] : _id;

            const deletedUser = await UserService.deleteUser(userId);

            if (!deletedUser) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error: any) {
            if (error.status === 401) {
                res.status(401).json({
                    success: false,
                    message: "unauthorized",
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }

    // verifyEmail
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    success: false,
                    message: "Email is required",
                });
                return;
            }

            const isVerified = await UserService.verifyEmail(email);

            if (!isVerified) {
                res.status(404).json({
                    success: false,
                    message: "Email not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Email verified successfully",
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }

    // new password
    async newpassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            const newpassword = await userServices.changepassword(email, password)
            if (!newpassword) {
                res.status(400).json({
                    success: false,
                    massage: "enter new password"
                })
            }
            res.status(200).json({
                success: true,
                massage: "password changed successfully"
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                massage: "faild to reset password"
            })
        }
    }

    // refresh token
    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    message: "Refresh token required",
                });
                return;
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET!
            ) as jwt.JwtPayload;

            const user = await UserService.getUserById(decoded.id);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            if (user.refreshToken !== refreshToken) {
                res.status(401).json({
                    success: false,
                    message: "Invalid refresh token",
                });
                return;
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: "15m",
                }
            );

            // Sync new token with DB
            await UserService.updateTokens(
                user._id.toString(),
                token,
                refreshToken
            );

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                token,
                refreshToken,
            });

        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.name === "TokenExpiredError" ? "Refresh token expired" : "Invalid refresh token",
            });
        }
    }

    // post address
    async addAddress(req: Request, res: Response): Promise<void> {
        console.log("Controller hit");
        console.log(req.params);

        try {
            const { _id } = req.params;
            const userId: string = Array.isArray(_id) ? _id[0] : _id;

            if (!_id) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const user = await userServices.addAddress(userId, req.body);

            res.status(200).json({
                success: true,
                message: "Address added successfully",
                data: user.address,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new UserController();