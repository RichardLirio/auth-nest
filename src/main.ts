import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<Env>>(ConfigService);
  const port = configService.get("PORT", { infer: true });

  // Definindo prefixo da versão da api
  const apiVersion = configService.getOrThrow("VERSION");
  app.setGlobalPrefix(`api/v${apiVersion}`);

  const allowedOrigins = configService
    .getOrThrow("CORS_ALLOWED_ORIGINS")
    .split(",");

  // Configuração para o cors
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  });

  // configuração do swagger
  const config = new DocumentBuilder()
    .setTitle("API de Autenticação de Usuários")
    .setDescription("Documentação da API para gerenciamento de usuários")
    .setVersion(apiVersion) //Setando a versão da api
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT retornado pela rota /sessions",
      },
      "JWT-auth" // Nome da autenticação no Swagger
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(port);
}
bootstrap();
