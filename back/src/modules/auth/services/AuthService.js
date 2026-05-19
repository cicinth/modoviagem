import { prisma } from "../../../config/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { createAuthToken, hashPassword, verifyPassword } from "../authUtils.js";

function asText(value) {
  return String(value || "").trim();
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export class AuthService {
  constructor(database = prisma) {
    this.database = database;
  }

  async register(input = {}) {
    const name = asText(input.name);
    const email = asText(input.email).toLowerCase();
    const password = String(input.password || "");

    if (!name) {
      throw new AppError("Informe o nome", 400);
    }

    if (!email) {
      throw new AppError("Informe o e-mail", 400);
    }

    if (password.length < 6) {
      throw new AppError("A senha deve ter pelo menos 6 caracteres", 400);
    }

    const existingUser = await this.database.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new AppError("E-mail já cadastrado", 409);
    }

    const user = await this.database.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password)
      }
    });

    return this.buildAuthResponse(user);
  }

  async login(input = {}) {
    const email = asText(input.email).toLowerCase();
    const password = String(input.password || "");

    if (!email || !password) {
      throw new AppError("Informe e-mail e senha", 400);
    }

    const user = await this.database.user.findUnique({ where: { email } });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    return this.buildAuthResponse(user);
  }

  async getUserById(id) {
    const user = await this.database.user.findUnique({ where: { id } });
    return user ? toPublicUser(user) : null;
  }

  buildAuthResponse(user) {
    return {
      user: toPublicUser(user),
      token: createAuthToken(user)
    };
  }
}
