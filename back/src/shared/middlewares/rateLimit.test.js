import { describe, expect, it } from "vitest";
import { createRateLimit } from "./rateLimit.js";

describe("createRateLimit", () => {
  it("blocks requests after the configured limit", () => {
    const middleware = createRateLimit({ windowMs: 60_000, max: 2 });
    const request = { headers: {}, ip: "127.0.0.1", body: { email: "a@example.com" } };
    const errors = [];
    const next = (error) => errors.push(error || null);

    middleware(request, {}, next);
    middleware(request, {}, next);
    middleware(request, {}, next);

    expect(errors[0]).toBeNull();
    expect(errors[1]).toBeNull();
    expect(errors[2].status).toBe(429);
  });
});
