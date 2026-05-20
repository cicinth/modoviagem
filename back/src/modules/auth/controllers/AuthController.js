import { getSessionToken } from "../authUtils.js";

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (request, response, next) => {
    try {
      const auth = await this.authService.register(request.body);
      this.setSessionCookie(response, auth.token);
      response.status(201).json({ user: auth.user });
    } catch (error) {
      next(error);
    }
  };

  login = async (request, response, next) => {
    try {
      const auth = await this.authService.login(request.body);
      this.setSessionCookie(response, auth.token);
      response.json({ user: auth.user });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_request, response) => {
    response.setHeader("Set-Cookie", this.buildSessionCookie("", 0));
    response.status(204).send();
  };

  updateAccount = async (request, response, next) => {
    try {
      const user = await this.authService.updateAccount(request.user.id, request.body);
      response.json({ user });
    } catch (error) {
      next(error);
    }
  };

  resendEmailVerification = async (request, response, next) => {
    try {
      response.json(await this.authService.resendEmailVerification(request.user.id));
    } catch (error) {
      next(error);
    }
  };

  confirmEmail = async (request, response, next) => {
    try {
      const auth = await this.authService.confirmEmail(request.body?.token);
      this.setSessionCookie(response, auth.token);
      response.json({ user: auth.user });
    } catch (error) {
      next(error);
    }
  };

  me = async (request, response, next) => {
    try {
      const user = await this.authService.getUserById(request.user.id);

      if (!user) {
        response.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      this.setSessionCookie(response, getSessionToken(request));
      response.json({ user });
    } catch (error) {
      next(error);
    }
  };

  setSessionCookie(response, token) {
    response.setHeader("Set-Cookie", this.buildSessionCookie(token));
  }

  buildSessionCookie(token, maxAge = 60 * 60 * 24 * 7) {
    const parts = [
      `viajario_session=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${maxAge}`
    ];

    if (process.env.NODE_ENV === "production") {
      parts.push("Secure");
    }

    return parts.join("; ");
  }
}
