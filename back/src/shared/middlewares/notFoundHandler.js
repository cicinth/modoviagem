export function notFoundHandler(_request, response) {
  response.status(404).json({ message: "Rota não encontrada" });
}
