import { Router } from "express";
import userController from "../controllers/user.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/login", userController.login);
router.post("/signup", userController.createUser);
router.post("/refresh", userController.refresh);
router.post("/verifyEmail", userController.verifyEmail);
router.post("/newpassword", userController.newpassword);

// Authenticated user routes
router.get("/:_id", authenticate, userController.getUserById);
router.put("/:_id", authenticate, userController.updateUser);
router.patch("/address/:_id", authenticate, userController.addAddress);

// Admin-only routes
router.get("/", authenticate, authorizeRoles("Admin"), userController.getAllUsers);
router.delete("/:_id", authenticate, authorizeRoles("Admin"), userController.deleteUser);

export default router;