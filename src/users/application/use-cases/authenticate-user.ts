import { User } from "@/users/domain/entities/user.entity";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { compare } from "bcryptjs";
import { UserEmailNotFound } from "../err/user-email-not-exist-error";
import { UserCredentialsError } from "../err/user-credentials-error";

// Parametros para utilização do caso de uso
interface AuthenticateUseCaseParams {
  email: string;
  password: string;
}
// Resposta do caso de uso
interface AuthenticateUseCaseResponse {
  user: User;
}

@Injectable()
export class AuthenticateUseCase {
  constructor(private readonly userRepository: UserRepository) {} // inicia o repositório de usuários

  async execute({
    email,
    password,
  }: AuthenticateUseCaseParams): Promise<AuthenticateUseCaseResponse> {
    // Verifica se o usuário existe e se a senha está correta
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserEmailNotFound();
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UserCredentialsError();
    }

    // Retorna o usuário autenticado
    return { user };
  }
}
