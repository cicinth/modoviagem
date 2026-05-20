import { AppError } from "../errors/AppError.js";

const buckets = new Map();
const cleanupEvery = 100;
let requestCount = 0;

function getClientKey(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : String(forwardedFor || request.ip || "");
  const email = String(request.body?.email || "").trim().toLowerCase();
  return `${ip.split(",")[0]}:${email}`;
}

function cleanup(now) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function createRateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return function rateLimit(request, _response, next) {
    const now = Date.now();
    requestCount += 1;

    if (requestCount % cleanupEvery === 0) {
      cleanup(now);
    }

    const key = getClientKey(request);
    const current = buckets.get(key);
    const bucket = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      next(new AppError("Muitas tentativas. Aguarde um pouco e tente novamente.", 429));
      return;
    }

    next();
  };
}
