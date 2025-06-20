import { UserRepository } from "@/users/domain/repositories/user.repository";
import { AuthenticateUseCase } from "./authenticate-user";
import { InMemoryUsersRepository } from "test/repositories/in-memory-usuario-repository";
import { randomUUID } from "node:crypto";
import { UserEmailNotFound } from "../err/user-email-not-exist-error";
import { UserCredentialsError } from "../err/user-credentials-error";
import { hashPassword } from "@/shared/utils/hash";

let userRepository: UserRepository;
let sut: AuthenticateUseCase; //sut -> sistem under test variavel global para a principal variavel que vai ser testada

describe("Authenticate Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new AuthenticateUseCase(userRepository);
  });

  it("should be able to authenticate a user", async () => {
    const now = new Date(); // cria a data atual
    const hashedPassword = await hashPassword("123456"); //faz o hash do password
    await userRepository.create({
      id: randomUUID(),
      name: "John Doe",
      email: "johndoe@example.com",
      password: hashedPassword,
      role: "user",
      createdAt: now,
      updatedAt: now,
    }); //criação de uma usuario

    const { user } = await sut.execute({
      email: "johndoe@example.com",
      password: "123456",
    }); //solicito login com as credenciais que usei para criar um usuario

    expect(user.email).toEqual("johndoe@example.com"); //espero que retorno o mesmo email
    expect(user.lastLogin).toEqual(expect.any(Date)); //espero que retorno a data do ultimo login
  });

  it("should not be possible to authenticate with an incorrect email address.", async () => {
    const now = new Date(); // cria a data atual
    await userRepository.create({
      id: randomUUID(),
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
      role: "user",
      createdAt: now,
      updatedAt: now,
    }); //criação de uma usuario

    await expect(() =>
      sut.execute({
        email: "johndoexample@example.com",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(UserEmailNotFound); //espero que quando eu informe quando o email nao existir na base de dados
  });

  it("should not be possible to authenticate with an incorrect password.", async () => {
    const now = new Date(); // cria a data atual
    await userRepository.create({
      id: randomUUID(),
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
      role: "user",
      createdAt: now,
      updatedAt: now,
    }); //criação de uma usuario

    await expect(() =>
      sut.execute({
        email: "johndoe@example.com",
        password: "invalidPassword",
      })
    ).rejects.toBeInstanceOf(UserCredentialsError); //espero que quando eu informe alguma credencial incorreta de o erro especifico
  });
});
