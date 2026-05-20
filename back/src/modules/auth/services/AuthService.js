import { prisma } from "../../../config/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { createAuthToken, hashPassword, verifyPassword } from "../authUtils.js";
import {
  createVerificationToken,
  hashVerificationToken,
  sendVerificationEmail,
  verificationExpiresAt
} from "../emailVerification.js";

function asText(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStrongPassword(password) {
  if (password.length < 8) {
    throw new AppError("A senha deve ter pelo menos 8 caracteres", 400);
  }

  if (password.length > 128) {
    throw new AppError("Senha muito longa", 400);
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new AppError("Use uma senha com maiúscula, minúscula, número e símbolo", 400);
  }
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    pendingEmail: user.pendingEmail,
    emailVerifiedAt: user.emailVerifiedAt,
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
    const passwordConfirmation = String(input.passwordConfirmation || "");

    if (!name) {
      throw new AppError("Informe o nome", 400);
    }

    if (!email) {
      throw new AppError("Informe o e-mail", 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError("Informe um e-mail válido", 400);
    }

    if (name.length > 120) {
      throw new AppError("Nome muito longo", 400);
    }

    validateStrongPassword(password);

    if (password !== passwordConfirmation) {
      throw new AppError("A confirmação da senha não confere", 400);
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

    await this.createAndSendEmailVerification(user.id, email);

    return this.buildAuthResponse(user);
  }

  async login(input = {}) {
    const email = asText(input.email).toLowerCase();
    const password = String(input.password || "");

    if (!email || !password) {
      throw new AppError("Informe e-mail e senha", 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const user = await this.database.user.findUnique({ where: { email } });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    return this.buildAuthResponse(user);
  }

  async getUserById(id) {
    if (!id) {
      return null;
    }

    const user = await this.database.user.findUnique({ where: { id } });
    return user ? toPublicUser(user) : null;
  }

  async updateAccount(userId, input = {}) {
    const user = await this.database.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const name = asText(input.name ?? user.name);
    const email = asText(input.email || "").toLowerCase();
    const currentPassword = String(input.currentPassword || "");
    const newPassword = String(input.newPassword || "");
    const newPasswordConfirmation = String(input.newPasswordConfirmation || "");
    const data = {};

    if (!name || name.length < 2) {
      throw new AppError("Informe um nome com pelo menos 2 caracteres", 400);
    }

    if (name.length > 120) {
      throw new AppError("Nome muito longo", 400);
    }

    if (name !== user.name) {
      data.name = name;
    }

    if (email && email !== user.email) {
      if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
        throw new AppError("Senha atual inválida", 401);
      }

      if (!isValidEmail(email)) {
        throw new AppError("Informe um e-mail válido", 400);
      }

      const existingEmail = await this.database.user.findFirst({
        where: {
          OR: [
            { email },
            { pendingEmail: email }
          ],
          NOT: { id: userId }
        }
      });

      if (existingEmail) {
        throw new AppError("Este e-mail já está em uso", 409);
      }

      data.pendingEmail = email;
    }

    if (newPassword) {
      if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
        throw new AppError("Senha atual inválida", 401);
      }

      validateStrongPassword(newPassword);

      if (newPassword !== newPasswordConfirmation) {
        throw new AppError("A confirmação da senha não confere", 400);
      }

      data.passwordHash = hashPassword(newPassword);
    }

    const updatedUser = Object.keys(data).length
      ? await this.database.user.update({ where: { id: userId }, data })
      : user;

    if (data.pendingEmail) {
      await this.createAndSendEmailVerification(userId, data.pendingEmail);
    }

    return toPublicUser(updatedUser);
  }

  async resendEmailVerification(userId) {
    const user = await this.database.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const email = user.pendingEmail || user.email;

    if (!user.pendingEmail && user.emailVerifiedAt) {
      throw new AppError("E-mail já confirmado", 400);
    }

    const recentToken = await this.database.emailVerificationToken.findFirst({
      where: {
        userId,
        email,
        usedAt: null,
        createdAt: { gt: new Date(Date.now() - 60_000) }
      },
      orderBy: { createdAt: "desc" }
    });

    if (recentToken) {
      throw new AppError("Aguarde um pouco antes de reenviar", 429);
    }

    await this.createAndSendEmailVerification(userId, email);
    return { message: "Enviamos um novo link de confirmação." };
  }

  async confirmEmail(token) {
    if (!token) {
      throw new AppError("Link de confirmação inválido", 400);
    }

    const tokenHash = hashVerificationToken(token);
    const verification = await this.database.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!verification || verification.usedAt) {
      throw new AppError("Link de confirmação inválido", 400);
    }

    if (verification.expiresAt < new Date()) {
      throw new AppError("Link de confirmação expirado", 400);
    }

    const targetEmail = verification.email.toLowerCase();
    const existingEmail = await this.database.user.findFirst({
      where: {
        email: targetEmail,
        NOT: { id: verification.userId }
      }
    });

    if (existingEmail) {
      throw new AppError("Este e-mail já está em uso", 409);
    }

    const updatedUser = await this.database.$transaction(async (transaction) => {
      await transaction.emailVerificationToken.update({
        where: { id: verification.id },
        data: { usedAt: new Date() }
      });

      return transaction.user.update({
        where: { id: verification.userId },
        data: {
          email: targetEmail,
          pendingEmail: null,
          emailVerifiedAt: new Date()
        }
      });
    });

    return this.buildAuthResponse(updatedUser);
  }

  async createAndSendEmailVerification(userId, email) {
    const token = createVerificationToken();

    await this.database.emailVerificationToken.create({
      data: {
        userId,
        email,
        tokenHash: hashVerificationToken(token),
        expiresAt: verificationExpiresAt()
      }
    });

    return sendVerificationEmail({ email, token });
  }

  buildAuthResponse(user) {
    return {
      user: toPublicUser(user),
      token: createAuthToken(user)
    };
  }
}
