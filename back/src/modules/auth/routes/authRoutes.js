import { Router } from "express";
import { authRequired } from "../../../shared/middlewares/authRequired.js";
import { createRateLimit } from "../../../shared/middlewares/rateLimit.js";
import { AuthController } from "../controllers/AuthController.js";
import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();
const authController = new AuthController(authService);

export const authRouter = Router();
const authRateLimit = createRateLimit({ windowMs: 60_000, max: 8 });

authRouter.post("/register", authRateLimit, authController.register);
authRouter.post("/login", authRateLimit, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/confirm-email", authRateLimit, authController.confirmEmail);
authRouter.get("/me", authRequired, authController.me);
authRouter.patch("/me", authRequired, authController.updateAccount);
authRouter.post("/email-verification/resend", authRequired, authRateLimit, authController.resendEmailVerification);
