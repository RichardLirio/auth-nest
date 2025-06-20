import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3333),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_DB: z.string(),
  DATABASE_URL: z.string().url(),
  VERSION: z.coerce.number().default(1),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
}); //esquema do arquivo env

export type Env = z.infer<typeof envSchema>;
