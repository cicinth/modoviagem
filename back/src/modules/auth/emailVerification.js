import crypto from "node:crypto";
import { env } from "../../config/env.js";

const TOKEN_BYTES = 32;
const TOKEN_TTL_HOURS = 24;

export function createVerificationToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashVerificationToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function verificationExpiresAt(now = new Date()) {
  return new Date(now.getTime() + TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

export function buildVerificationLink(token) {
  const origin = env.frontOrigins[0] || "http://localhost:5173";
  return `${origin}/confirmar-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail({ email, token }) {
  const link = buildVerificationLink(token);

  if (env.isProduction) {
    console.info(`Email de confirmacao pendente para ${email}. Configure um provedor SMTP para envio real.`);
    return { delivered: false, link: "" };
  }

  console.info(`Link de confirmacao para ${email}: ${link}`);
  return { delivered: true, link };
}
