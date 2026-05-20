import { env } from "../../config/env.js";

export function securityHeaders(_request, response, next) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'; base-uri 'self'");

  if (env.isProduction) {
    response.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
}
