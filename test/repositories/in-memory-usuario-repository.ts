import { User } from "@/users/domain/entities/user.entity";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { randomUUID } from "node:crypto";
import { register } from "node:module";
/// Cria uma classe que implementa a interface do repositório de usuários
/// Essa classe é responsável por armazenar os usuários em memória
export class InMemoryUsersRepository implements UserRepository {
  public items: User[] = []; // Armazena os usuários em memória

  async findMany(
    params: {
      role?: string;
      sortBy?: "name" | "createdAt";
      order?: "asc" | "desc";
    } = {}
  ): Promise<User[]> {
    let result = [...this.items]; // Create a copy to avoid mutating the original array

    // Filter by role if provided
    if (params.role) {
      result = result.filter((user) => user.role === params.role);
    }

    // Sort if sortBy and order are provided
    if (params.sortBy && params.order) {
      result.sort((a, b) => {
        if (params.sortBy === "name") {
          return params.order === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          return params.order === "asc"
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
    }

    return result;
  }

  async findByEmail(email: string) {
    // Busca um usuário pelo email
    const user = this.items.find((item) => item.email === email); // Encontra o usuário pelo email

    if (!user) {
      // Se o usuário não for encontrado, retorna null
      return null;
    }

    return user; // Retorna o usuário encontrado ou null se não existir
  }

  async findById(userId: string) {
    // Busca um usuário pelo email
    const user = this.items.find((item) => item.id === userId); // Encontra o usuário pelo email

    if (!user) {
      // Se o usuário não for encontrado, retorna null
      return null;
    }

    return user; // Retorna o usuário encontrado ou null se não existir
  }

  async create(data: User) {
    // Cria um novo usuário em memória
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(user); // Adiciona o usuário à lista de usuários em memória

    return user; // Retorna o usuário criado
  }

  async registerLogin(userId: string) {
    // Atualiza um usuário em memória
    const index = this.items.findIndex((item) => item.id === userId); // Encontra o usuário pelo ID
    const now = new Date();

    Object.assign(this.items[index], { ...this.items[index], lastLogin: now }); // Atualiza os dados do usuário encontrado

    return this.items[index]; // Retorna o usuário encontrado ou null se não existir
  }

  async deleteById(id: string) {
    // Busca um usuário pelo ID
    const user = this.items.find((item) => item.id === id); // Encontra o usuário pelo ID

    if (!user) {
      return null; // Se o usuário não for encontrado, retorna null
    }

    const userIndex = this.items.findIndex((item) => item.id === id); // Encontra o índice do usuário na lista de usuários

    this.items.splice(userIndex, 1); // Remove o usuário da lista de usuários em memória

    return user; // Retorna o usuário encontrado ou null se não existir
  }
}
