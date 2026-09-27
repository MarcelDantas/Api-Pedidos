import express from "express";
import { pedidosRouter } from "./api/pedidos.routes";
import { ensureSchema } from "./database";

const app = express();

app.use(express.json());
app.use(pedidosRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT ?? 3000;

ensureSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`API de Pedidos rodando na porta ${PORT}`);
  });
});