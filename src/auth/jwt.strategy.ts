import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { z } from "zod";
import { Env } from "@/env";

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable() //TODA CLASSE PROVIDER PRECISA DO INJECTABLE
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const publicKey = config.get("JWT_PUBLIC_KEY", { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, "base64"),
      algorithms: ["RS256"],
    });
  }

  async validate(payload: UserPayload) {
    //validar o payload do token se possui os campos criados
    return tokenPayloadSchema.parse(payload); //realza o parse e verifica se bate
  }
}
