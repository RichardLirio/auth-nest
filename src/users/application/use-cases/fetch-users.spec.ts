import { UserRepository } from "@/users/domain/repositories/user.repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-usuario-repository";
import { randomUUID } from "node:crypto";
import { hashPassword } from "@/shared/utils/hash";
import { FetchUsersUseCase } from "./fetch-users";

let userRepository: UserRepository;
let sut: FetchUsersUseCase;

describe("Fetch Users Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new FetchUsersUseCase(userRepository);
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

  // Testes do caso de uso de busca de todos os usuarios
  it("is possible to search for a list that contains data from all users", async () => {
    const now = new Date(); // cria data atual
    await createUser("John Doe", "johndoe@example.com", "user", now);
    await createUser("Jane Admin", "jane@example.com", "admin", now);

    // Executa o caso de uso para buscar todos os usuários
    const { users } = await sut.execute();

    // Verifica se a lista de usuarios retornada tem o tamanho correto e contém os usuarios criados
    expect(users).toHaveLength(2);
    expect(users).toEqual([
      expect.objectContaining({ role: "user", email: "johndoe@example.com" }),
      expect.objectContaining({ role: "admin", email: "jane@example.com" }),
    ]);
  });

  // Testa se a lista de usuarios retornada está vazia quando não há usuarios cadastrados
  it("is possible to search for an empty list that does not contain user data", async () => {
    const { users } = await sut.execute();

    expect(users).toHaveLength(0);
  });

  it("should filter users by role", async () => {
    await createUser(
      "John Doe",
      "johndoe@example.com",
      "user",
      new Date("2023-01-01")
    );
    await createUser(
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

    const { users } = await sut.execute({ role: "user" });

    expect(users).toHaveLength(2);
    expect(users.map((u) => u.email)).toEqual([
      "johndoe@example.com",
      "bob@example.com",
    ]);
  });

  // Test ordenação por name em ordem ascendente
  it("should sort users by name in ascending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    await createUser(
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

    const { users } = await sut.execute({ sortBy: "name", order: "asc" });

    expect(users.map((u) => u.name)).toEqual([
      "Alice Admin",
      "Bob User",
      "Charlie Doe",
    ]);
  });

  // Test ordenação por name em ordem descendente
  it("should sort users by name in descending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    await createUser(
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

    const { users } = await sut.execute({ sortBy: "name", order: "desc" });

    expect(users.map((u) => u.name)).toEqual([
      "Charlie Doe",
      "Bob User",
      "Alice Admin",
    ]);
  });

  // Test de ordenação do createdAt na ordem ascendente
  it("should sort users by createdAt in ascending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    await createUser(
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

    const { users } = await sut.execute({ sortBy: "createdAt", order: "asc" });

    expect(users.map((u) => u.email)).toEqual([
      "bob@example.com",
      "alice@example.com",
      "charlie@example.com",
    ]);
  });

  // Test de ordenação do createdAt na ordem descendente
  it("should sort users by createdAt in descending order", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    await createUser(
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

    const { users } = await sut.execute({ sortBy: "createdAt", order: "desc" });

    expect(users.map((u) => u.email)).toEqual([
      "charlie@example.com",
      "alice@example.com",
      "bob@example.com",
    ]);
  });

  // Test filtro de role e ordenando por nome
  it("should filter users by role and sort by name", async () => {
    await createUser(
      "Bob User",
      "bob@example.com",
      "user",
      new Date("2023-01-01")
    );
    await createUser(
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

    const { users } = await sut.execute({
      role: "user",
      sortBy: "name",
      order: "asc",
    });

    expect(users).toHaveLength(2);
    expect(users.map((u) => u.name)).toEqual(["Bob User", "Charlie User"]);
  });
});
