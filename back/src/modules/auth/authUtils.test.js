import { afterEach, describe, expect, it, vi } from "vitest";
import { createAuthToken, getCookieToken, getSessionToken, hashPassword, verifyAuthToken, verifyPassword } from "./authUtils.js";

describe("authUtils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("hashes and verifies passwords", () => {
    const hash = hashPassword("segredo123");

    expect(verifyPassword("segredo123", hash)).toBe(true);
    expect(verifyPassword("outra-senha", hash)).toBe(false);
  });

  it("creates and verifies auth tokens", () => {
    const token = createAuthToken({
      id: "user-1",
      name: "Cinthia",
      email: "cinthia@example.com"
    });

    expect(verifyAuthToken(token)).toMatchObject({
      id: "user-1",
      sub: "user-1",
      name: "Cinthia",
      email: "cinthia@example.com",
      exp: expect.any(Number)
    });
  });

  it("rejects expired auth tokens", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const token = createAuthToken({ id: "user-1", name: "Cinthia", email: "cinthia@example.com" });

    vi.setSystemTime(new Date("2026-01-09T00:00:00.000Z"));

    expect(() => verifyAuthToken(token)).toThrow("Sessão expirada");
  });

  it("reads tokens from cookies and prefers bearer tokens", () => {
    const request = {
      headers: {
        authorization: "Bearer bearer-token",
        cookie: "theme=light; viajario_session=cookie-token"
      }
    };

    expect(getCookieToken(request)).toBe("cookie-token");
    expect(getSessionToken(request)).toBe("bearer-token");
  });
});
