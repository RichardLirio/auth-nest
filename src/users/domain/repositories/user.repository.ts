import { User } from "../entities/user.entity";

export abstract class UserRepository {
  //interface de repositorio o modulo de usuario
  abstract create(user: User): Promise<User>;
  abstract delete(userId: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(userId: string): Promise<User | null>;
  abstract registerLogin(userId: string): Promise<User>;
  abstract findMany(params?: {
    role?: string;
    sortBy?: "name" | "createdAt";
    order?: "asc" | "desc";
  }): Promise<User[]>;
  abstract update(userId: string, data: Partial<User>): Promise<User>;
}
