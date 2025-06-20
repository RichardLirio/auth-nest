import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import request from "supertest";
import { Repository } from "typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { cleanupTestDatabase, setupTestDatabase } from "test/setup-e2e";

describe("Create user (E2E)", () => {
  let app: INestApplication;
  let userRepository: Repository<UserOrmEntity>;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity)
    );
    await app.init();
  }); //cria o setup antes dos testes

  afterAll(async () => {
    await app.close();
    await cleanupTestDatabase();
  }); //derruba schemas apos os testes

  test("[POST] /auth/register", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      });

    expect(response.statusCode).toBe(201); //status code esperado no retorno da rota de criação de usuario

    const userOnDatabase = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: "johndoe@example.com" })
      .getOne();

    expect(userOnDatabase).toBeTruthy(); //verifica dentro do banco de dados se o usuario foi criado
  });
});
