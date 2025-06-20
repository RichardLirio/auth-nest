import { DataSource, DataSourceOptions } from "typeorm";
import { UserOrmEntity } from "./entities/user-entity";
import "dotenv/config";

const url = new URL(process.env.DATABASE_URL!);
const schema = url.searchParams.get("schema") || "public"; // Extrai o schema da URL

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  schema,
  entities: [UserOrmEntity],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
  migrationsTableName: "migrations",
};

export const appDataSource = new DataSource(dataSourceOptions);
