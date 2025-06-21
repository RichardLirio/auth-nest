import { User } from "@/users/domain/entities/user.entity";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { UserNotExists } from "../err/user-not-exists-error";

// Id utilizado para busca do usuario
interface GetUserProfileUseCaseParams {
  userId: string;
}

interface GetUserProfileUseCaseResponse {
  user: User;
} // Cria uma interface para a resposta do caso de uso

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseParams): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotExists();
    }

    return { user };
  }
}
