import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import request from "supertest";
import { Repository } from "typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { cleanupTestDatabase, setupTestDatabase } from "test/setup-e2e";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";

describe("Get User Profile (E2E)", () => {
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

  it("[PATCH] /user/:id - should update own profile as user", async () => {
    const user = await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );

    const token = await getToken(user);

    const response = await request(app.getHttpServer())
      .patch(`/user/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jane Doe",
        email: "jane.doe@example.com",
        password: "newpass123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual(
      expect.objectContaining({
        id: user.id,
        name: "Jane Doe",
        email: "jane.doe@example.com",
        role: "user",
      })
    );

    const updatedUser = await userRepository.findOneBy({ id: user.id });
    expect(updatedUser).toEqual(
      expect.objectContaining({
        name: "Jane Doe",
        email: "jane.doe@example.com",
      })
    );
  });

  it("[PATCH] /user/:id - should return 403 when user tries to update their role", async () => {
    const user = await createUser(
      "John Doe",
      "john@example.com",
      "user",
      new Date("2023-01-01")
    );

    const token = await getToken(user);

    const response = await request(app.getHttpServer())
      .patch(`/user/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      message: "Users cannot update their role",
      error: "Forbidden",
    });

    const unchangedUser = await userRepository.findOneBy({ id: user.id });
    expect(unchangedUser).toEqual(expect.objectContaining({ role: "user" }));
  });
});
