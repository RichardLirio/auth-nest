import { UserEmailConflictError } from "@/domain/user/application/err/user-email-already-exist-error";
import { User } from "../../enterprise/entities/user.entity";
import { hashPassword } from "../../utils/hash";
import { UserRepository } from "../repositories/user.repository";
import { randomUUID } from "node:crypto";

interface CreateUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
} //parametros para criação de uma usuario

interface CreateUserUseCaseResponse {
  user: User;
} //retorno do caso de uso para criação de um usuario

export class CreateUserUseCase {
  //caso de uso para criação de um usuario
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    name,
    email,
    password,
    role,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userExists = await this.userRepository.findByEmail(email); //verifica se o usuario existe

    if (userExists) throw new UserEmailConflictError(); //retorna erro caso usuario ja exista

    const hashedPassword = await hashPassword(password); //faz o hash do password

    const now = new Date(); // cria a data atual

    const user = await this.userRepository.create({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      createdAt: now,
      updatedAt: now,
    }); // cria um novo um usuario utilizando o repositorio utilizado

    return { user }; //retorno o objeto com o usuario
  }
}
