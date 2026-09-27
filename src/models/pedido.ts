export type PedidoStatus = "CRIADO" | "CONFIRMADO" | "CANCELADO"

export interface Pedido {
    id: number;
    cliente: string;
    produto: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
    status: PedidoStatus;
    data_criacao: Date;
}