import { Injectable } from "@nestjs/common";
import { UserRepository } from "@/users/domain/repositories/user.repository";
import { UserNotExists } from "../err/user-not-exists-error";
import { User } from "@/users/domain/entities/user.entity";
import { hashPassword } from "@/shared/utils/hash";
import { UserEmailConflictError } from "../err/user-email-already-exist-error";

interface UpdateUserUseCaseParams {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  role?: "user" | "admin";
}

interface UpdateUserUseCaseResponse {
  user: User;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    userId,
    name,
    email,
    password,
    role,
  }: UpdateUserUseCaseParams): Promise<UpdateUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotExists();
    }

    const updatedFields: Partial<User> = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (password) updatedFields.password = await hashPassword(password);
    if (role) updatedFields.role = role;

    if (email) {
      const userExists = await this.userRepository.findByEmail(email); //verifica se o usuario existe

      if (userExists) throw new UserEmailConflictError(); //retorna erro caso usuario ja exista
    }

    const updatedUser = await this.userRepository.update(userId, updatedFields);

    return { user: updatedUser };
  }
}
