import "dotenv/config";
import sql from "mssql";

const config: sql.config = {
  server: process.env.DB_SERVER ?? "localhost",
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME ?? "pedidos",
  user: process.env.DB_USER ?? "sa",
  password: process.env.DB_PASSWORD ?? "",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

async function conectarComRetry(configConexao: sql.config): Promise<sql.ConnectionPool> {
  const tentativas = 10;
  const intervaloMs = 3000;

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      return await new sql.ConnectionPool(configConexao).connect();
    } catch (erro) {
      console.log(
        `Tentativa ${tentativa} de conexão com o banco falhou. Tentando novamente em ${intervaloMs / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, intervaloMs));
    }
  }

  throw new Error("Não foi possível conectar ao banco de dados após várias tentativas.");
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool) {
    return pool;
  }

  const nomeBanco = config.database as string;

  const poolMaster = await conectarComRetry({ ...config, database: "master" });
  await poolMaster.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${nomeBanco}')
    CREATE DATABASE [${nomeBanco}]
  `);
  await poolMaster.close();

  pool = await conectarComRetry(config);
  return pool;
}

export async function ensureSchema(): Promise<void> {
  const pool = await getPool();
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pedidos')
    CREATE TABLE pedidos (
      id INT IDENTITY(1,1) PRIMARY KEY,
      cliente NVARCHAR(200) NOT NULL,
      produto NVARCHAR(200) NOT NULL,
      quantidade INT NOT NULL,
      valor_unitario DECIMAL(10,2) NOT NULL,
      valor_total DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      data_criacao DATETIME2 NOT NULL DEFAULT GETDATE()
    )
  `);
}