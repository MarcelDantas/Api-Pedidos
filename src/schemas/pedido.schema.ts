import { z } from "zod";

export const criarPedidoSchema = z.object({
  cliente: z.string().min(1, "cliente é obrigatório"),
  produto: z.string().min(1, "produto é obrigatório"),
  quantidade: z.number().int().positive(),
  valor_unitario: z.number().positive(),
});

export type CriarPedidoInput = z.infer<typeof criarPedidoSchema>;

export const alterarStatusSchema = z.object({
  status: z.enum(["CRIADO", "CONFIRMADO", "CANCELADO"]),
});

export type AlterarStatusInput = z.infer<typeof alterarStatusSchema>;