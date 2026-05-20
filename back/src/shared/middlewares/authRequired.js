import { AppError } from "../errors/AppError.js";
import { getSessionToken, verifyAuthToken } from "../../modules/auth/authUtils.js";

export function authRequired(request, _response, next) {
  try {
    const token = getSessionToken(request);

    if (!token) {
      throw new AppError("Autenticação necessária", 401);
    }

    request.user = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
