import { UserRepository } from "@/users/domain/repositories/user.repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-usuario-repository";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";
import { GetUserProfileUseCase } from "./get-user-profile";
import { UserNotExists } from "../err/user-not-exists-error";

let userRepository: UserRepository;
let sut: GetUserProfileUseCase;

describe("Get User Porfile Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new GetUserProfileUseCase(userRepository);
  });

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

  // Testes do caso de uso de busca os dados do usuario
  it("is possible to search for a profile user", async () => {
    const now = new Date(); // cria data atual
    const userCreated = await createUser(
      "John Doe",
      "johndoe@example.com",
      "user",
      now
    );

    // Executa o caso de uso para buscar
    const { user } = await sut.execute({ userId: userCreated.id });

    expect(user.id).toEqual(expect.any(String)); // Verifica se o id do usuário é uma string
    expect(user.name).toEqual("John Doe"); // Verifica se o nome do usuário é o esperado
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
