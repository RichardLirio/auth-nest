import { beforeEach, describe, expect, it } from "vitest";
import { UserRepository } from "../../domain/repositories/user.repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-usuario-repository";
import { UpdateUserUseCase } from "./update-user";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";
import { UserNotExists } from "../err/user-not-exists-error";

let userRepository: UserRepository;
let sut: UpdateUserUseCase;

describe("Update User Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new UpdateUserUseCase(userRepository);
  }); // Cria uma nova instância do repositório de usuários e do caso de uso antes de cada teste

  // Função para criar usuario
  async function createUser(
    name: string,
    email: string,
    role: "user" | "admin",
    createdAt: Date
  ) {
    const hashedPassword = await hashPassword("123456");
    const user = {
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt,
      updatedAt: new Date(),
    };
    return userRepository.create(user);
  }

  // Testes do caso de uso de atualizar usuário
  it("should be update a user", async () => {
    const now = new Date(); // cria data atual
    const userCreated = await createUser(
      "John Doe",
      "johndoe@example.com",
      "user",
      now
    );

    const { user } = await sut.execute({
      userId: userCreated.id,
      name: "John Doe update",
      email: "johndoe@example.com",
      password: "123456",
      role: "user",
    });

    expect(user.name).toEqual("John Doe update");
  });

  // teste de falha quando não encontrado o usuario na base de dados
  it("is not possible to retrieve data from a user with an incorrect ID", async () => {
    await expect(() =>
      sut.execute({
        userId: "non-existing-id",
      })
    ).rejects.toBeInstanceOf(UserNotExists); // Verifica se o erro retornado é do tipo ResourceNotFoundError
  });
});
