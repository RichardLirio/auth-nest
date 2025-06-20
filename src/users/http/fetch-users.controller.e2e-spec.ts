import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import request from "supertest";
import { Repository } from "typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  cleanupTableUserDatabase,
  cleanupTestDatabase,
  setupTestDatabase,
} from "test/setup-e2e";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";
import { JwtService } from "@nestjs/jwt";

describe("Fetch Users (E2E)", () => {
  let app: INestApplication;
  let userRepository: Repository<UserOrmEntity>;
  let jwtService: JwtService;

  beforeAll(async () => {
    await setupTestDatabase();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity)
    );
    jwtService = moduleRef.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTableUserDatabase(); // preciso limpar o banco de dados por conta do email ser um campo unico e utilizo o mesmo para mock
  });

  // Função para criar usuario no banco de dados
  async function createUser(
    name: string,
    email: string,
    role: "user" | "admin",
    createdAt: Date
  ) {
    const hashedPassword = await hashPassword("123456");
    const user = userRepository.create({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt,
      updatedAt: new Date(),
    });
    return await userRepository.save(user);
  }

  // Função para gerar o token
  async function getToken(User: UserOrmEntity) {
    return jwtService.sign({ sub: User.id, role: User.role });
  }

  //teste de sucesso com o token de um admin user
  it("[GET] /api/v1/users - should fetch all users", async () => {
    await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );
    const adminUser = await createUser(
      "Jane Admin",
      "jane@example.com",
      "admin",
      new Date("2023-01-02")
    );

    const token = await getToken(adminUser);
    const response = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: "John Doe",
          email: "john@example.com",
          role: "user",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: expect.any(String),
          lastLogin: null,
        }),
        expect.objectContaining({
          id: expect.any(String),
          name: "Jane Admin",
          email: "jane@example.com",
          role: "admin",
          createdAt: "2023-01-02T00:00:00.000Z",
          updatedAt: expect.any(String),
          lastLogin: null,
        }),
      ])
    );
  });

  // teste de sucesso filtrando por role
  it("[GET] /api/v1/users?role=user - should filter users by role", async () => {
    await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );
    const userAdmin = await createUser(
      "Jane Admin",
      "jane@example.com",
      "admin",
      new Date("2023-01-02")
    );
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-03")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?role=user")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users.map((u: UserOrmEntity) => u.email)).toEqual([
      "john@example.com",
      "bob@example.com",
    ]);
  });

  // Teste de ordenação de usuarios por nome em ordem ascendente
  it("[GET] /api/v1/users?sortBy=name&order=asc - should sort users by name in ascending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );
    await createUser(
      "Charlie Doe",
      "charlie@example.com",
      "user",
      new Date("2023-01-03")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?sortBy=name&order=asc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users.map((u: UserOrmEntity) => u.name)).toEqual([
      "Alice Admin",
      "Bob User",
      "Charlie Doe",
    ]);
  });

  // Teste de ordenação de usuarios por nome em ordem descendente
  it("[GET] /api/v1/users?sortBy=name&order=desc - should sort users by name in descending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );
    await createUser(
      "Charlie Doe",
      "charlie@example.com",
      "user",
      new Date("2023-01-03")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?sortBy=name&order=desc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users.map((u: UserOrmEntity) => u.name)).toEqual([
      "Charlie Doe",
      "Bob User",
      "Alice Admin",
    ]);
  });

  // Teste para teste ordenação de usuarios por data de criação na ordem ascendente
  it("[GET] /api/v1/users?sortBy=createdAt&order=asc - should sort users by createdAt in ascending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );
    await createUser(
      "Charlie Doe",
      "charlie@example.com",
      "user",
      new Date("2023-01-03")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?sortBy=createdAt&order=asc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users.map((u: UserOrmEntity) => u.email)).toEqual([
      "bob@example.com",
      "alice@example.com",
      "charlie@example.com",
    ]);
  });

  // Teste para teste ordenação de usuarios por data de criação na ordem descendente
  it("[GET] /api/v1/users?sortBy=createdAt&order=desc - should sort users by createdAt in descending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );
    await createUser(
      "Charlie Doe",
      "charlie@example.com",
      "user",
      new Date("2023-01-03")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?sortBy=createdAt&order=desc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users.map((u: UserOrmEntity) => u.email)).toEqual([
      "charlie@example.com",
      "alice@example.com",
      "bob@example.com",
    ]);
  });

  // teste de filtro por role e ordenado por nome
  it("[GET] /api/v1/users?role=user&sortBy=name&order=asc - should filter by role and sort by name", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );
    await createUser(
      "Charlie User",
      "charlie@example.com",
      "user",
      new Date("2023-01-03")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?role=user&sortBy=name&order=asc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users.map((u: UserOrmEntity) => u.name)).toEqual([
      "Bob User",
      "Charlie User",
    ]);
  });

  // Teste de requisições feitas por usuarios que não são admin
  it("[GET] /api/v1/users - should return 403 for non-admin users", async () => {
    const user = await createUser(
      "Charlie User",
      "charlie@example.com",
      "user",
      new Date("2023-01-03")
    );
    const token = await getToken(user);
    const response = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      message: "Insufficient permissions",
      error: "Forbidden",
    });
  });

  // Teste para requisições não feitas com o jwt
  it("[GET] /api/v1/users - should return 401 for unauthenticated requests", async () => {
    const response = await request(app.getHttpServer()).get("/users");

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  // Teste quando a query de ordenação é passada invalida
  it("[GET] /api/v1/users?role=invalid - should return 400 for invalid role", async () => {
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?role=invalid")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringContaining("Validation failed")
    );
  });

  // Teste quando a query de ordenação é passada invalida
  it("[GET] /api/v1/users?sortBy=invalid - should return 400 for invalid sortBy", async () => {
    const userAdmin = await createUser(
      "Alice Admin",
      "alice@example.com",
      "admin",
      new Date("2023-01-02")
    );

    const token = await getToken(userAdmin);
    const response = await request(app.getHttpServer())
      .get("/users?sortBy=invalid")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringContaining("Validation failed")
    );
  });
});
