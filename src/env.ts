import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3333),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_DB: z.string(),
  DATABASE_SCHEMA: z.string(),
  DATABASE_HOST: z.string(),
  VERSION: z.coerce.number(),
  JWT_SECRET: z.string(),
}); //esquema do arquivo env

export type Env = z.infer<typeof envSchema>;
