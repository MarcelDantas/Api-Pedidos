import { Pedido, PedidoStatus } from "../models/pedido";
import { CriarPedidoInput } from "../schemas/pedido.schema";
import * as pedidoRepository from "../repositories/pedido.repository";

export async function criarPedido(dados: CriarPedidoInput): Promise<Pedido> {
  const valor_total = dados.quantidade * dados.valor_unitario;

  return pedidoRepository.criar({
    ...dados,
    valor_total,
    status: "CRIADO",
  });
}

export async function buscarPedido(id: number): Promise<Pedido | null> {
  return pedidoRepository.buscarPorId(id);
}

export async function listarPedidos(): Promise<Pedido[]> {
  return pedidoRepository.listarTodos();
}

export async function alterarStatusPedido(
  id: number,
  status: PedidoStatus
): Promise<Pedido | null> {
  return pedidoRepository.atualizarStatus(id, status);
}

export async function deletarPedido(id: number): Promise<boolean> {
  return pedidoRepository.deletar(id);
}