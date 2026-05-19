import { Router } from "express";
import { authRequired } from "../../../shared/middlewares/authRequired.js";
import { AuthController } from "../controllers/AuthController.js";
import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", authRequired, authController.me);
