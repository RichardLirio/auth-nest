import { beforeEach, describe, expect, it } from "vitest";
import { compare } from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserUseCase } from "./create-user";
import { InMemoryUsersRepository } from "test/repositories/in-memory-usuario-repository";
import { UserEmailConflictError } from "../err/user-email-already-exist-error";

let userRepository: UserRepository;
let sut: CreateUserUseCase;

describe("Create User Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new CreateUserUseCase(userRepository);
  }); // Cria uma nova instância do repositório de usuários e do caso de uso antes de cada teste

  // Testes do caso de uso de criação de usuário
  it("should be able to register a user", async () => {
    const { user } = await sut.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
      role: "user",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  // Testa se o usuário foi criado com os dados corretos
  it("should be able to hash password", async () => {
    const { user } = await sut.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
      role: "user",
    });

    const isPasswordCorrectlyHashed = await compare("123456", user.password);

    expect(isPasswordCorrectlyHashed).toBe(true);
  });

  // Testa se o usuário não pode ser criado com o mesmo email
  it("should not be possible to create a user with the same email", async () => {
    await sut.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
      role: "user",
    });

    await expect(() =>
      sut.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
        role: "user",
      })
    ).rejects.toBeInstanceOf(UserEmailConflictError);
  });
});
