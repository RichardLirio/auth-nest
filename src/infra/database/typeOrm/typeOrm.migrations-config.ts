import { Env } from "@/env";
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";

const config = new ConfigService<Env, true>();

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: config.get("DATABASE_HOST", { infer: true }),
  port: 5432,
  username: config.get("DATABASE_USER", { infer: true }),
  password: config.get("DATABASE_PASSWORD", { infer: true }),
  database: config.get("DATABASE_DB", { infer: true }),
  entities: [],
  migrations: [__dirname + "/migrations/*.ts"],
};

export default new DataSource(dataSourceOptions);
