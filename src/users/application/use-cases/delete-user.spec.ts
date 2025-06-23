import { UserRepository } from "@/users/domain/repositories/user.repository";
import { DeleteUserUseCase } from "./delete-user";
import { InMemoryUsersRepository } from "test/repositories/in-memory-usuario-repository";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";
import { UserNotExists } from "../err/user-not-exists-error";

let userRepository: UserRepository;
let sut: DeleteUserUseCase;

describe("Delete User Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new DeleteUserUseCase(userRepository);
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
  // Testes do caso de uso de exclusão de usuário
  it("is possible to delete user", async () => {
    const now = new Date(); // cria data atual
    const userCreated = await createUser(
      "John Doe",
      "johndoe@example.com",
      "user",
      now
    );

    await sut.execute({
      userId: userCreated.id,
    });

    const user = await userRepository.findById(userCreated.id);

    expect(user).toBeNull();
  });

  // Testa se o usuário não pode ser excluído com um id incorreto
  it("is not possible to delete a user with an incorrect ID", async () => {
    await expect(() =>
      sut.execute({
        userId: "non-existing-id",
      })
    ).rejects.toBeInstanceOf(UserNotExists);
  });
});
