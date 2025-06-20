import { Env } from "@/env";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserOrmEntity } from "./typeOrm/entities/user-entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService<Env, true>) => {
        const url = new URL(config.get("DATABASE_URL", { infer: true }));
        const schema = url.searchParams.get("schema") || "public"; // Extrai o schema da URL
        return {
          type: "postgres",
          url: config.get("DATABASE_URL", { infer: true }),
          schema, // Define o schema explicitamente
          entities: [UserOrmEntity],
          migrations: [__dirname + "/migrations/*.ts"],
          synchronize: false,
          migrationsRun: false, // Evita rodar migrações automaticamente
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
