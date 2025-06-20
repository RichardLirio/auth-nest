import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTable1750362417716 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      new URL(process.env.DATABASE_URL!).searchParams.get("schema") || "public";
    // Verifica se a tabela já existe
    const tableExists = await queryRunner.hasTable(`"${schema}"."users"`);
    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE "${schema}"."users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying(256) NOT NULL,
          "email" character varying(256) NOT NULL,
          "password" character varying(256) NOT NULL,
          "role" character varying NOT NULL DEFAULT 'user',
          "lastLogin" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
          CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema =
      new URL(process.env.DATABASE_URL!).searchParams.get("schema") || "public";
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."users"`);
  }
}
