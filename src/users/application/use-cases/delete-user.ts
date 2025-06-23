import { User } from "@/users/domain/entities/user.entity";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { UserNotExists } from "../err/user-not-exists-error";

/// Cria uma interface para os parâmetros de entrada do caso de uso
interface DeleteUserUseCaseParams {
  userId: string;
}

interface DeleteUserUseCaseResponse {
  user: User;
} // Cria uma interface para a resposta do caso de uso

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
  }: DeleteUserUseCaseParams): Promise<DeleteUserUseCaseResponse> {
    // Verifica se o usuário existe e se existir deleta o mesmo
    const user = await this.userRepository.deleteById(userId);
    // Se o usuário não existir, lança um erro
    if (!user) {
      throw new UserNotExists();
    }

    return { user }; // Retorna o usuário excluído
  }
}
