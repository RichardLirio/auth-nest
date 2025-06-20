import { User } from "@/users/domain/entities/user.entity";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { Injectable } from "@nestjs/common";

// Filtros e ordenações opcionais
interface FetchUsersUseCaseRequest {
  role?: string;
  sortBy?: "name" | "createdAt";
  order?: "asc" | "desc";
}

interface FetchUsersUseCaseResponse {
  users: User[];
} // Cria uma interface para a resposta do caso de uso

@Injectable()
export class FetchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    params: FetchUsersUseCaseRequest = {}
  ): Promise<FetchUsersUseCaseResponse> {
    const { role, sortBy, order } = params;
    const users = await this.userRepository.findMany({ role, sortBy, order });
    return { users };
  }
}
