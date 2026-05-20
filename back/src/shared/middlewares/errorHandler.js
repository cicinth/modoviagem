import { AppError } from "../errors/AppError.js";

export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    response.status(error.status).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Erro interno no servidor" });
}
