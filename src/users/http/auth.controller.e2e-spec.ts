import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import request from "supertest";
import { Repository } from "typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { cleanupTestDatabase, setupTestDatabase } from "test/setup-e2e";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";

describe("Auth user (E2E)", () => {
  let app: INestApplication;
  let userRepository: Repository<UserOrmEntity>;

  beforeAll(async () => {
    await setupTestDatabase();

    const now = new Date(); // cria a data atual
    const hashedPassword = await hashPassword("123456");

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity)
    );
    await app.init();

    //Criação do usuario para todos os testes de autenticação
    await userRepository.insert({
      id: randomUUID(),
      name: "John Doe",
      email: "johndoe@example.com",
      password: hashedPassword,
      role: "user",
      createdAt: now,
      updatedAt: now,
    }); //criação de uma usuario
  }); //cria o setup antes dos testes

  afterAll(async () => {
    await app.close();
    await cleanupTestDatabase();
  }); //derruba schemas apos os testes

  // Teste de sucesso para autenticação
  test("[POST] /auth/login", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "johndoe@example.com",
        password: "123456",
      });

    expect(response.statusCode).toBe(200); //status code esperado no retorno da rota de criação de usuario
    expect(response.body).toEqual({ access_token: expect.any(String) }); // access token presente na reposta
    const userOnDatabase = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: "johndoe@example.com" })
      .getOne();

    expect(userOnDatabase.lastLogin).toBeTruthy(); //verifica dentro do banco de dados se foi registrado o ultimo login
  });

  // Teste de erro com email invalido
  test("[POST] /auth/login - should fail with invalid email", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "invalid-email",
        password: "123456",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(String), // messagem de erro
      errors: expect.any(Object),
    });
  });

  // Teste de erro validação do zod
  test("[POST] /auth/login - should fail with missing fields", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "johndoe@example.com",
        // password ausente
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(String), // messagem de erro
      errors: expect.any(Object),
    });
  });

  // Teste de erro quando o email não é registrado na base de dados
  test("[POST] /auth/login - should fail with unregistered email", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "123456",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toEqual({
      statusCode: 409,
      message: expect.any(String), // Mensagem do UserEmailNotFound
      error: "Conflict",
    });
  });

  // Teste de erro quando a senha está incorreta
  test("[POST] /auth/login - should fail with wrong password", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "johndoe@example.com",
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: expect.any(String), // Mensagem do UserCredentialsError
      error: "Unauthorized",
    });
  });

  // Teste de erro quando não enviado o body
  test("[POST] /auth/login - should fail with empty body", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.any(String), // messagem de erro
      errors: expect.any(Object),
    });
  });
});
