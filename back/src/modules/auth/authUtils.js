import crypto from "node:crypto";
import { AppError } from "../../shared/errors/AppError.js";
import { env } from "../../config/env.js";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  if (hash.length !== candidate.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function signPayload(payload) {
  return crypto.createHmac("sha256", env.authSecret).update(payload).digest("base64url");
}

export function createAuthToken(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name
  })).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function verifyAuthToken(token) {
  const [payload, signature] = String(token || "").split(".");

  if (!payload || !signature) {
    throw new AppError("Sessão inválida", 401);
  }

  const expectedSignature = signPayload(payload);

  if (signature.length !== expectedSignature.length) {
    throw new AppError("Sessão inválida", 401);
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new AppError("Sessão inválida", 401);
  }

  let data;

  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new AppError("Sessão inválida", 401);
  }

  if (!data?.sub) {
    throw new AppError("Sessão inválida", 401);
  }

  return data;
}

export function getBearerToken(request) {
  const authorization = request.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}
