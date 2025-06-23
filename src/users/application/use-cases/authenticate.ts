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
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    lastLogin: Date;
  };
}

@Injectable()
export class AuthenticateUseCase {
  constructor(private readonly userRepository: UserRepository) {} // inicia o repositório de usuários

  async execute({
    email,
    password,
  }: AuthenticateUseCaseParams): Promise<AuthenticateUseCaseResponse> {
    // Verifica se o usuário existe e se a senha está correta
    const userOnDatabase = await this.userRepository.findByEmail(email);

    if (!userOnDatabase) {
      throw new UserEmailNotFound();
    }

    const isPasswordValid = await compare(password, userOnDatabase.password);

    if (!isPasswordValid) {
      throw new UserCredentialsError();
    }

    const registerUserLogin = await this.userRepository.registerLogin(
      userOnDatabase.id
    ); // registra ultimo login do usuario

    const user = {
      id: registerUserLogin.id,
      name: registerUserLogin.name,
      email: registerUserLogin.email,
      role: registerUserLogin.role,
      lastLogin: registerUserLogin.lastLogin,
    };

    // Retorna o usuário autenticado
    return { user };
  }
}
