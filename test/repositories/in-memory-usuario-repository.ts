import { User } from "@/users/domain/entities/user.entity";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { randomUUID } from "node:crypto";
import { register } from "node:module";
/// Cria uma classe que implementa a interface do repositório de usuários
/// Essa classe é responsável por armazenar os usuários em memória
export class InMemoryUsersRepository implements UserRepository {
  public items: User[] = []; // Armazena os usuários em memória

  // async deleteById(id: string) {
  //   // Busca um usuário pelo ID
  //   const user = this.items.find((item) => item.id === id); // Encontra o usuário pelo ID

  //   if (!user) {
  //     return null; // Se o usuário não for encontrado, retorna null
  //   }

  //   const userIndex = this.items.findIndex((item) => item.id === id); // Encontra o índice do usuário na lista de usuários

  //   this.items.splice(userIndex, 1); // Remove o usuário da lista de usuários em memória

  //   return user; // Retorna o usuário encontrado ou null se não existir
  // }

  // async findMany() {
  //   const result = this.items.map((user) => {
  //     const empresa = this.empresas.find((e) => e.id === user.empresaId);

  //     return {
  //       id: user.id,
  //       nome: user.nome,
  //       email: user.email,
  //       cargo: user.cargo,
  //       createdAt: user.createdAt,
  //       empresa: {
  //         nome: empresa?.nome ?? "Empresa não encontrada",
  //       },
  //     };
  //   });

  //   return result;
  // }

  // async findById(id: string) {
  //   // Busca um usuário pelo ID
  //   const user = this.items.find((item) => item.id === id); // Encontra o usuário pelo ID

  //   if (!user) {
  //     return null; // Se o usuário não for encontrado, retorna null
  //   }

  //   const empresa = this.empresas.find((item) => item.id === user.empresaId); // Encontra o veiculo pelo ID

  //   return {
  //     id: user.id,
  //     nome: user.nome,
  //     email: user.email,
  //     cargo: user.cargo,
  //     createdAt: user.createdAt,
  //     empresaId: user.empresaId,
  //     empresa: {
  //       nome: empresa?.nome ?? "",
  //       cnpj: empresa?.cnpj ?? "",
  //       Url_Ws: empresa?.Url_Ws ?? "",
  //     },
  //   }; // Retorna o usuário encontrado ou null se não existir
  // }

  async findByEmail(email: string) {
    // Busca um usuário pelo email
    const user = this.items.find((item) => item.email === email); // Encontra o usuário pelo email

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
}
