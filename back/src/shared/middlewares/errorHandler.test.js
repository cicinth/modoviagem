import { describe, expect, it, vi } from "vitest";
import { AppError } from "../errors/AppError.js";
import { errorHandler } from "./errorHandler.js";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe("errorHandler", () => {
  it("returns safe messages for unexpected errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = createResponse();

    errorHandler(new Error("Prisma internal details"), {}, response, () => {});

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: "Erro interno no servidor" });
    console.error.mockRestore();
  });

  it("returns app error messages", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = createResponse();

    errorHandler(new AppError("Autenticação necessária", 401), {}, response, () => {});

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ message: "Autenticação necessária" });
    expect(console.error).not.toHaveBeenCalled();
    console.error.mockRestore();
  });
});
