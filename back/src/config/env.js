const defaultFrontOrigins = ["http://localhost:5173", "http://localhost:5174"];
const configuredFrontOrigins = (process.env.FRONT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 3333),
  frontOrigins: [...new Set([...configuredFrontOrigins, ...defaultFrontOrigins])],
  authSecret: process.env.AUTH_SECRET || "viajario-development-secret"
};
