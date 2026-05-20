import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashVerificationToken } from "../emailVerification.js";
import { hashPassword } from "../authUtils.js";
import { AuthService } from "./AuthService.js";

function createUser(overrides = {}) {
  return {
    id: "user-1",
    name: "Cinthia",
    email: "cinthia@example.com",
    pendingEmail: null,
    emailVerifiedAt: null,
    passwordHash: hashPassword("Senha@123"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  };
}

function createDatabase(initialUser = null) {
  const users = new Map(initialUser ? [[initialUser.id, initialUser]] : []);
  const tokens = new Map();

  return {
    users,
    tokens,
    user: {
      async findUnique({ where }) {
        if (where.id) return users.get(where.id) || null;
        if (where.email) return [...users.values()].find((user) => user.email === where.email) || null;
        return null;
      },
      async findFirst({ where }) {
        const candidates = [...users.values()].filter((user) => user.id !== where.NOT?.id);
        return candidates.find((user) => where.OR?.some((filter) => (
          filter.email === user.email || filter.pendingEmail === user.pendingEmail
        ))) || null;
      },
      async create({ data }) {
        const user = createUser({ id: `user-${users.size + 1}`, ...data });
        users.set(user.id, user);
        return user;
      },
      async update({ where, data }) {
        const current = users.get(where.id);
        const updated = { ...current, ...data, updatedAt: new Date("2026-01-02T00:00:00.000Z") };
        users.set(where.id, updated);
        return updated;
      }
    },
    emailVerificationToken: {
      async create({ data }) {
        const token = { id: `token-${tokens.size + 1}`, usedAt: null, createdAt: new Date(), ...data };
        tokens.set(token.tokenHash, token);
        return token;
      },
      async findFirst() {
        return null;
      },
      async findUnique({ where }) {
        const token = tokens.get(where.tokenHash) || null;
        return token ? { ...token, user: users.get(token.userId) } : null;
      },
      async update({ where, data }) {
        const current = [...tokens.values()].find((token) => token.id === where.id);
        const updated = { ...current, ...data };
        tokens.set(updated.tokenHash, updated);
        return updated;
      }
    },
    async $transaction(callback) {
      return callback(this);
    }
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    console.info.mockRestore();
  });

  it("requires strong password and matching confirmation on register", async () => {
    const service = new AuthService(createDatabase());

    await expect(service.register({
      name: "Cinthia",
      email: "cinthia@example.com",
      password: "12345678",
      passwordConfirmation: "12345678"
    })).rejects.toThrow("Use uma senha");

    await expect(service.register({
      name: "Cinthia",
      email: "cinthia@example.com",
      password: "Senha@123",
      passwordConfirmation: "Senha@124"
    })).rejects.toThrow("confirmação");
  });

  it("creates verification token without storing raw token", async () => {
    const database = createDatabase();
    const service = new AuthService(database);

    await service.register({
      name: "Cinthia",
      email: "cinthia@example.com",
      password: "Senha@123",
      passwordConfirmation: "Senha@123"
    });

    const [token] = database.tokens.values();
    expect(token.email).toBe("cinthia@example.com");
    expect(token.tokenHash).toHaveLength(64);
    expect(token.tokenHash).not.toContain(".");
  });

  it("updates account name and protects email/password changes with current password", async () => {
    const user = createUser();
    const database = createDatabase(user);
    const service = new AuthService(database);

    await expect(service.updateAccount(user.id, {
      email: "nova@example.com",
      currentPassword: "errada"
    })).rejects.toThrow("Senha atual inválida");

    const updated = await service.updateAccount(user.id, {
      name: "Cinthia Cardoso",
      email: "nova@example.com",
      currentPassword: "Senha@123"
    });

    expect(updated).toMatchObject({
      name: "Cinthia Cardoso",
      email: "cinthia@example.com",
      pendingEmail: "nova@example.com"
    });
  });

  it("confirms email with a valid token only once", async () => {
    const user = createUser({ pendingEmail: "nova@example.com" });
    const database = createDatabase(user);
    const rawToken = "token-seguro";
    const tokenHash = hashVerificationToken(rawToken);
    database.tokens.set(tokenHash, {
      id: "token-1",
      userId: user.id,
      email: "nova@example.com",
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date()
    });
    const service = new AuthService(database);

    const response = await service.confirmEmail(rawToken);

    expect(response.user).toMatchObject({
      email: "nova@example.com",
      pendingEmail: null,
      emailVerifiedAt: expect.any(Date)
    });
    await expect(service.confirmEmail(rawToken)).rejects.toThrow("inválido");
  });
});
