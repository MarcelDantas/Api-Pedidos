import { Router } from "express";
import { criarPedidoSchema, alterarStatusSchema } from "../schemas/pedido.schema";
import * as pedidoService from "../services/pedido.service";

export const pedidosRouter = Router();

pedidosRouter.post("/pedidos", async (req, res) => {
  const parsed = criarPedidoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erro: parsed.error.flatten() });
  }

  const pedido = await pedidoService.criarPedido(parsed.data);
  res.status(201).json(pedido);
});

pedidosRouter.get("/pedidos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const pedido = await pedidoService.buscarPedido(id);

  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  res.status(200).json(pedido);
});

pedidosRouter.delete("/pedidos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const removido = await pedidoService.deletarPedido(id);

  if (!removido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  res.status(204).send();
});

pedidosRouter.get("/pedidos", async (_req, res) => {
  const pedidos = await pedidoService.listarPedidos();
  res.status(200).json(pedidos);
});

pedidosRouter.patch("/pedidos/:id/status", async (req, res) => {
  const parsed = alterarStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erro: parsed.error.flatten() });
  }

  const id = Number(req.params.id);
  const pedido = await pedidoService.alterarStatusPedido(id, parsed.data.status);

  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  res.status(200).json(pedido);
});