import { describe, expect, it } from "vitest";
import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from "./authUtils.js";

describe("authUtils", () => {
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
      sub: "user-1",
      name: "Cinthia",
      email: "cinthia@example.com"
    });
  });
});
