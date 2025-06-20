import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<Env>>(ConfigService);
  const port = configService.get("PORT", { infer: true });

  const config = new DocumentBuilder()
    .setTitle("API de Autenticação de Usuários")
    .setDescription("Documentação da API para gerenciamento de usuários")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document); // Configuração do Swagger

  await app.listen(port);
}
bootstrap();
