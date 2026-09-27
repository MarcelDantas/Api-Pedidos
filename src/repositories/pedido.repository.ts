import sql from "mssql";
import { getPool } from "../database";
import { Pedido, PedidoStatus } from "../models/pedido";

export async function criar(
  dados: Omit<Pedido, "id" | "data_criacao">
): Promise<Pedido> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("cliente", sql.NVarChar, dados.cliente)
    .input("produto", sql.NVarChar, dados.produto)
    .input("quantidade", sql.Int, dados.quantidade)
    .input("valor_unitario", sql.Decimal(10, 2), dados.valor_unitario)
    .input("valor_total", sql.Decimal(10, 2), dados.valor_total)
    .input("status", sql.VarChar, dados.status)
    .query(`
      INSERT INTO pedidos (cliente, produto, quantidade, valor_unitario, valor_total, status, data_criacao)
      OUTPUT INSERTED.*
      VALUES (@cliente, @produto, @quantidade, @valor_unitario, @valor_total, @status, GETDATE())
    `);

  return result.recordset[0];
}

export async function buscarPorId(id: number): Promise<Pedido | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM pedidos WHERE id = @id");

  return result.recordset[0] ?? null;
}

export async function listarTodos(): Promise<Pedido[]> {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM pedidos ORDER BY id");
  return result.recordset;
}

export async function atualizarStatus(
  id: number,
  status: PedidoStatus
): Promise<Pedido | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("status", sql.VarChar, status)
    .query(`
      UPDATE pedidos SET status = @status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0] ?? null;
}

export async function deletar(id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM pedidos WHERE id = @id");

  return result.rowsAffected[0] > 0;
}