import cors from "cors";
import express from "express";
import { tripsRouter } from "./routes/trips.js";

const app = express();
const port = process.env.PORT || 3333;
const frontOrigin = process.env.FRONT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: frontOrigin }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "modoviagem-back" });
});

app.use("/api/trips", tripsRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.status || 500).json({
    message: error.message || "Erro interno no servidor"
  });
});

app.listen(port, () => {
  console.log(`ModoViagem API rodando em http://localhost:${port}`);
});
