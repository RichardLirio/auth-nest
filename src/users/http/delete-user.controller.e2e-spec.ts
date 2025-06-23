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

describe("Delete User (E2E)", () => {
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

  it("[DELETE] /user/:id - should delete own profile as user", async () => {
    const user = await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );

    const token = await getToken(user);

    const response = await request(app.getHttpServer())
      .delete(`/user/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});

    // Verify user is deleted
    const deletedUser = await userRepository.findOneBy({ id: user.id });
    expect(deletedUser).toBeNull();
  });

  it("[DELETE] /user/:id - should delete any profile as admin", async () => {
    const user = await createUser(
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
      .delete(`/user/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});

    // Verify user is deleted
    const deletedUser = await userRepository.findOneBy({ id: user.id });
    expect(deletedUser).toBeNull();
  });

  it("[DELETE] /user/:id - should return 401 for unauthorized request", async () => {
    const user = await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );

    const response = await request(app.getHttpServer()).delete(
      `/user/${user.id}`
    );

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  it("[DELETE] /user/:id - should return 403 for user deleting another profile", async () => {
    const user1 = await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );
    const user2 = await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-03")
    );
    const token = await getToken(user1);

    const response = await request(app.getHttpServer())
      .delete(`/user/${user2.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      message: "Insufficient permissions",
      error: "Forbidden",
    });

    // Verify user2 is not deleted
    const userStillExists = await userRepository.findOneBy({ id: user2.id });
    expect(userStillExists).not.toBeNull();
  });

  it("[DELETE] /user/:id - should return 400 for invalid UUID", async () => {
    const admin = await createUser(
      "Jane Admin",
      "jane@example.com",
      "admin",
      new Date("2023-01-02")
    );
    const token = await getToken(admin);

    const response = await request(app.getHttpServer())
      .delete("/user/invalid-uuid")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Validation failed");
  });

  it("[DELETE] /user/:id - should return 404 for non-existent user", async () => {
    const admin = await createUser(
      "Jane Admin",
      "jane@example.com",
      "admin",
      new Date("2023-01-02")
    );
    const token = await getToken(admin);
    const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";

    const response = await request(app.getHttpServer())
      .delete(`/user/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: "User not found",
      error: "Not Found",
    });
  });
});
