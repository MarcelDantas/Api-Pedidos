# API Pedidos

Trabalho 1 da disciplina **Desenvolvimento de Sistemas Distribuídos** (UNIP) — API de Pedidos implementada em **TypeScript**.

## Arquitetura

```
Cliente (Postman) → API (Express/TypeScript) → SQL Server
```

A aplicação é organizada em 3 camadas lógicas, todas empacotadas no mesmo container:

- **API/Controller** (`src/api`) — recebe requisições HTTP, valida entrada, devolve respostas
- **Service** (`src/services`) — regras de negócio (cálculo de `valor_total`, status inicial)
- **Repository** (`src/repositories`) — único ponto do código que executa SQL contra o banco

O SQL Server roda em um **container separado**, com volume persistente — os dados sobrevivem a reinícios da API.

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Framework HTTP | Express 5 |
| Validação de entrada | Zod |
| Banco de dados | SQL Server 2022 |
| Driver do banco | `mssql` (node-mssql) |
| Containerização | Docker + Docker Compose |

## Modelo de Pedido

| Campo | Tipo | Observação |
|---|---|---|
| `id` | number | gerado automaticamente pelo banco |
| `cliente` | string | |
| `produto` | string | |
| `quantidade` | number | |
| `valor_unitario` | number | |
| `valor_total` | number | calculado pela aplicação (`quantidade * valor_unitario`) |
| `status` | `"CRIADO"` \| `"CONFIRMADO"` \| `"CANCELADO"` | definido pela aplicação (`"CRIADO"` na criação) |
| `data_criacao` | Date | gerado automaticamente pelo banco |

## Endpoints

| Método | Rota | Descrição | Body |
|---|---|---|---|
| `GET` | `/health` | verifica se a aplicação está no ar | — |
| `POST` | `/pedidos` | cria um pedido | `{ "cliente", "produto", "quantidade", "valor_unitario" }` |
| `GET` | `/pedidos` | lista todos os pedidos | — |
| `GET` | `/pedidos/:id` | consulta um pedido pelo id | — |
| `PATCH` | `/pedidos/:id/status` | altera o status de um pedido | `{ "status": "CRIADO" \| "CONFIRMADO" \| "CANCELADO" }` |
| `DELETE` | `/pedidos/:id` | remove um pedido | — |

### Exemplo — criar pedido

```
POST http://127.0.0.1:3000/pedidos
Content-Type: application/json

{
  "cliente": "Ray",
  "produto": "Teclado",
  "quantidade": 2,
  "valor_unitario": 150
}
```

Resposta (`201 Created`):
```json
{
  "id": 1,
  "cliente": "Ray",
  "produto": "Teclado",
  "quantidade": 2,
  "valor_unitario": 150,
  "valor_total": 300,
  "status": "CRIADO",
  "data_criacao": "2026-09-06T20:56:13.400Z"
}
```

> **Importante (Windows):** use `127.0.0.1` em vez de `localhost` nas requisições — em algumas máquinas `localhost` resolve para IPv6 e a porta publicada pelo Docker só escuta em IPv4, causando timeout.

## Como rodar

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando.

Clone o repositório e entre na pasta:
```bash
git clone https://github.com/rocha-Railton/Api-Pedidos.git
cd Api-Pedidos
```

Suba os containers:
```bash
docker compose up --build
```

Isso sobe dois containers:
- `pedidos-api` — a aplicação, na porta `3000`
- `pedidos-sqlserver` — o banco, na porta `1433`

Na primeira subida, a API tenta se conectar ao banco várias vezes (retry automático) até o SQL Server terminar de inicializar — é esperado ver algumas mensagens de "tentativa X falhou" no log antes de `API de Pedidos rodando na porta 3000`.

A aplicação cria automaticamente o banco `pedidos` e a tabela `pedidos` na primeira execução (não é preciso rodar nenhum script SQL manual).

Para parar:
```bash
docker compose down
```

Para parar **e apagar os dados** (reseta o volume do banco):
```bash
docker compose down -v
```

## Variáveis de ambiente

Configuradas em `docker-compose.yml` para o ambiente containerizado. Para rodar a API localmente fora do Docker (`npm run dev`), crie um `.env` na raiz:

```
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=pedidos
DB_USER=sa
DB_PASSWORD=<sua senha>
PORT=3000
```

## Estrutura do projeto

```
api-pedidos/
├── src/
│   ├── api/pedidos.routes.ts          # Controller — rotas Express
│   ├── services/pedido.service.ts     # regras de negócio
│   ├── repositories/pedido.repository.ts  # acesso ao banco (SQL)
│   ├── models/pedido.ts               # tipos do domínio
│   ├── schemas/pedido.schema.ts       # validação Zod
│   ├── database.ts                    # conexão + criação do banco/tabela
│   └── main.ts                        # inicialização do Express
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Experimento de persistência

Para comprovar que os dados sobrevivem a reinícios da aplicação (a persistência real está no container do banco, não na memória da API):

```bash
# 1. Cria um pedido
curl -X POST http://127.0.0.1:3000/pedidos -H "Content-Type: application/json" -d "{\"cliente\":\"Ray\",\"produto\":\"Teclado\",\"quantidade\":2,\"valor_unitario\":150}"

# 2. Reinicia só o container da API (não o do banco)
docker compose restart pedidos

# 3. Consulta de novo
curl http://127.0.0.1:3000/pedidos
```

O pedido criado no passo 1 continua presente após o restart.
