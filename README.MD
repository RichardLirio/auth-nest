## configugar arquivo .env

## npm install

## Criar container pgsql

## Rodar migrations
comando: npm run migration:create --name=user-table ;  npm run migration:generate --name=user-table; npm run migration:run

# Configuração das Chaves JWT

Este projeto utiliza o algoritmo RS256 para geração e verificação de tokens JWT. Abaixo, explico o motivo da escolha do algoritmo, como as chaves foram geradas e como configurar o ambiente para testes.

## Por que usar o algoritmo RS256?

O algoritmo RS256 (RSA com SHA-256) foi escolhido por sua segurança e flexibilidade em cenários onde múltiplos serviços podem precisar verificar tokens JWT:

- **Segurança assimétrica**: RS256 usa um par de chaves (privada e pública). A chave privada é usada para assinar o token, enquanto a chave pública é usada para verificação. Isso garante que apenas o serviço com a chave privada pode gerar tokens válidos, enquanto outros serviços podem verificar os tokens usando apenas a chave pública, sem acesso à chave sensível.
- **Escalabilidade**: Em arquiteturas com múltiplos backends ou serviços, a chave pública pode ser facilmente compartilhada com outros sistemas para verificar tokens sem a necessidade de gerar novos JWTs. Isso é ideal para cenários onde novos serviços são adicionados, como mencionado no contexto do projeto.
- **Robustez**: Comparado a algoritmos simétricos como HS256, o RS256 é mais seguro para cenários distribuídos, pois a chave privada não precisa ser compartilhada.

## Como as chaves foram geradas?

As chaves privada e pública foram geradas usando o OpenSSL com os seguintes comandos:

1. Geração da chave privada:
   ```bash
   openssl genrsa -out private_key.pem 2048
   ```
2. Geração da chave pública a partir da chave privada:
   ```bash
   openssl rsa -pubout -in private_key.pem -out public_key.pem
   ```
3. Conversão das chaves para Base64:
   ```bash
   base64 -i private_key.pem -o private_key_base64.txt
   base64 -i public_key.pem -o public_key_base64.txt
   ```

Os conteúdos dos arquivos `private_key_base64.txt` e `public_key_base64.txt` foram usados para criar as variáveis `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` no arquivo `.env.example`.

## Configuração para Testes

Para facilitar a execução do projeto em um ambiente de teste (como em um teste técnico), incluí chaves de exemplo no arquivo `.env.example`. **Essas chaves são apenas para testes e não devem ser usadas em produção.**

### Passos para configurar o ambiente de teste

1. Copie o arquivo `.env.example` para `.env`:
   - No Linux/macOS:
     ```bash
     cp .env.example .env
     ```
   - No Windows (Prompt de Comando):
     ```cmd
     copy .env.example .env
     ```
2. O arquivo `.env` agora contém as variáveis `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` prontas para uso em testes.
3. Execute o projeto normalmente, conforme descrito na documentação do projeto.

**Atenção**: As chaves no `.env.example` são apenas para testes. Para uso em produção, siga as instruções abaixo para gerar chaves seguras.

## Configuração para Produção

Para gerar chaves seguras para uso em produção:

1. Instale o OpenSSL:
   - No Linux/macOS, o OpenSSL geralmente já está instalado. Verifique com `openssl version`.
   - No Windows, baixe o OpenSSL em [Win32 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html) e adicione o diretório `bin` (ex.: `C:\Program Files\OpenSSL-Win64\bin`) à variável de ambiente `Path`.
2. Gere as chaves com os seguintes comandos:
   ```bash
   openssl genrsa -out private_key.pem 2048
   openssl rsa -pubout -in private_key.pem -out public_key.pem
   ```
   (No Windows, execute esses comandos no Prompt de Comando ou Git Bash.)
3. Converta as chaves para Base64:
   - No Linux/macOS:
     ```bash
     base64 -i private_key.pem -o private_key_base64.txt
     base64 -i public_key.pem -o public_key_base64.txt
     ```
   - No Windows (use o PowerShell):
     ```powershell
     powershell -Command "$privateKeyBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes('private_key.pem')); $privateKeyBase64 | Out-File -FilePath private_key_base64.txt -Encoding ASCII"
     powershell -Command "$publicKeyBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes('public_key.pem')); $publicKeyBase64 | Out-File -FilePath public_key_base64.txt -Encoding ASCII"
     ```
4. Crie ou edite o arquivo `.env` e adicione as variáveis:
   ```env
   JWT_PRIVATE_KEY=<conteúdo de private_key_base64.txt>
   JWT_PUBLIC_KEY=<conteúdo de public_key_base64.txt>
   ```
5. Delete os arquivos temporários:
   - No Linux/macOS:
     ```bash
     rm private_key.pem public_key.pem private_key_base64.txt public_key_base64.txt
     ```
   - No Windows:
     ```cmd
     del private_key.pem public_key.pem private_key_base64.txt public_key_base64.txt
     ```

## Notas de Segurança

- O arquivo `.env` **não deve** ser incluído no controle de versão. Verifique se o `.gitignore` contém:
  ```gitignore
  .env
  private_key.pem
  public_key.pem
  private_key_base64.txt
  public_key_base64.txt
  ```
- As chaves no `.env.example` são apenas para testes. Sempre gere novas chaves para ambientes de produção.
- A chave pública pode ser compartilhada com outros serviços que precisem verificar os tokens JWT, enquanto a chave privada deve ser mantida segura.

Se precisar de mais detalhes ou ajustes no projeto, consulte a documentação ou entre em contato!

## Run tests

 npm run test:e2e ; npm run test -> unitarios

## Rodar em desenvolvimento

npm run start:dev

## Configuração da API

Todas as rotas da API usam um prefixo global no formato `/api/v<versão>`, onde `<versão>` é definida pela variável `VERSION` no arquivo `.env`. Por padrão, o valor é `1`, resultando em rotas como `/api/v1/users`.

Para alterar a versão da API:
1. Edite o arquivo `.env` e modifique a variável `VERSION`. Exemplo:
   ```env
   VERSION=2


### Como usar a autenticação no Swagger

1. **Obter o token JWT**:
- Acesse a rota `POST /api/v1/auth/login`.
- Insira um email e senha válidos no corpo da requisição (ex.: `{ "email": "johndoe@example.com", "password": "123456" }`).
- Copie o `access_token` retornado na resposta.

2. **Configurar o token**:
- Clique no botão **Authorize** no topo da interface do Swagger.
- Insira o token no formato `Bearer <access_token>` (ex.: `Bearer eyJ...`).
- Clique em **Authorize** para salvar.

3. **Testar rotas protegidas**:
- Acesse rotas como `GET /api/v1/users` ou `GET /api/v1/user/userId`.
- O token será automaticamente incluído nas requisições.
- Verifique as respostas:
   - Erros 401 (não autenticado) ou 403 (não autorizado) serão retornados se o token for inválido ou a role for inadequada.

### Listar Usuários

A rota `GET /api/v1/users` lista todos os usuários, com suporte a filtros e ordenação. Requer autenticação JWT com role `admin`.

**Parâmetros de consulta (query parameters):**
- `role` (opcional): Filtra usuários por papel (`admin` ou `user`). Ex.: `?role=admin`
- `sortBy` (opcional): Ordena por `name` ou `createdAt`. Ex.: `?sortBy=name`
- `order` (opcional): Ordem de classificação (`asc` ou `desc`). Ex.: `?order=asc`

**Exemplo de requisição:**
```bash
GET /api/v1/users?role=admin&sortBy=name&order=asc
Authorization: Bearer <access_token>