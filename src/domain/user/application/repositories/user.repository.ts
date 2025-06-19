import { User } from "@/domain/user/enterprise/entities/user.entity";

export interface UserRepository {
  //interface de repositorio o modulo de usuario
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
