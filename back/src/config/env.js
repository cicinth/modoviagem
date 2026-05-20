const defaultFrontOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];
const configuredFrontOrigins = (process.env.FRONT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";
const authSecret = process.env.AUTH_SECRET || "";

if (isProduction && (!authSecret || authSecret === "viajario-development-secret" || authSecret.length < 32)) {
  throw new Error("AUTH_SECRET forte e obrigatorio em producao");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT || 3333),
  frontOrigins: [...new Set([...configuredFrontOrigins, ...defaultFrontOrigins])],
  authSecret: authSecret || "viajario-development-secret",
  authTokenTtlSeconds: Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7),
  defaultUserEmail: process.env.DEFAULT_USER_EMAIL || "",
  defaultUserPassword: process.env.DEFAULT_USER_PASSWORD || ""
};
