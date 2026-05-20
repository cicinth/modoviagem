import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi, tripsApi } from "./api.js";

function mockResponse(body, options = {}) {
  return Promise.resolve({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: () => Promise.resolve(body)
  });
}

describe("tripsApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists trips using the configured API base URL", async () => {
    const trips = [{ id: "1", name: "Rio" }];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse(trips));

    await expect(tripsApi.list()).resolves.toEqual(trips);
    expect(fetchSpy).toHaveBeenCalledWith("http://localhost:3333/api/trips", {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
  });

  it("serializes created trips as JSON", async () => {
    const trip = { name: "Berlim" };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ id: "2", ...trip }));

    await tripsApi.create(trip);

    expect(fetchSpy).toHaveBeenCalledWith("http://localhost:3333/api/trips", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify(trip),
      headers: { "Content-Type": "application/json" }
    });
  });

  it("sends auth tokens with protected requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ user: { id: "1" } }));

    await authApi.me("token-123");

    expect(fetchSpy).toHaveBeenCalledWith("http://localhost:3333/api/auth/me", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123"
      }
    });
  });

  it("throws API error messages", async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ message: "Destino obrigatório" }, { ok: false, status: 400 }));

    await expect(tripsApi.create({})).rejects.toThrow("Destino obrigatório");
  });
});
