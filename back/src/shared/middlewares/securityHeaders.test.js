import { describe, expect, it } from "vitest";
import { securityHeaders } from "./securityHeaders.js";

describe("securityHeaders", () => {
  it("sets defensive HTTP headers", () => {
    const headers = {};
    const response = {
      setHeader(name, value) {
        headers[name] = value;
      }
    };

    securityHeaders({}, response, () => {});

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });
});
