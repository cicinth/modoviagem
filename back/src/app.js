import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/routes/authRoutes.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import { securityHeaders } from "./shared/middlewares/securityHeaders.js";
import { notFoundHandler } from "./shared/middlewares/notFoundHandler.js";
import { tripsRouter } from "./modules/trips/routes/tripRoutes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(cors({ origin: env.frontOrigins, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "viajario-back" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/trips", tripsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
