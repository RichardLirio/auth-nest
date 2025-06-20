import { execSync } from "node:child_process";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import "dotenv/config";

const schemaId = `test_${randomUUID()}`; // Gerando schema unico

function generateTestDatabaseUrl(schema: string): string {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set("schema", schema);
  return url.toString(); // gera toda a url para conectar ao banco de dados
}

export const databaseUrl = generateTestDatabaseUrl(schemaId);
process.env.DATABASE_URL = databaseUrl;

export async function setupTestDatabase() {
  // Conecta ao banco para criar o schema
  const connection = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
  });

  await connection.initialize();
  await connection.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`);
  await connection.destroy();

  // Roda as migrações
  execSync("npm run migration:run", { stdio: "inherit" });
}

export async function cleanupTestDatabase() {
  const connection = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
  });

  await connection.initialize();
  await connection.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await connection.destroy();
}
