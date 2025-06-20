import { Env } from "@/env";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserOrmEntity } from "./typeOrm/entities/user-entity";

@Module({
  //modulo do typeorm configurado com as variaveis de ambientes
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService<Env, true>) => ({
        type: "postgres",
        host: config.get("DATABASE_HOST", { infer: true }),
        port: 5432,
        username: config.get("DATABASE_USER", { infer: true }),
        password: config.get("DATABASE_PASSWORD", { infer: true }),
        database: config.get("DATABASE_DB", { infer: true }),

        entities: [UserOrmEntity],
        migrations: [__dirname + "/migrations/*.ts"],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
