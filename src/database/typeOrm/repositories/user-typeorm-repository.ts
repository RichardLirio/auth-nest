import { UserRepository } from "@/users/domain/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserOrmEntity } from "../entities/user-entity";
import { User } from "@/users/domain/entities/user.entity";

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>
  ) {}

  async findMany(
    params: {
      role?: string;
      sortBy?: "name" | "createdAt";
      order?: "asc" | "desc";
    } = {}
  ): Promise<User[]> {
    let query = this.repo.createQueryBuilder("user");

    // Filtro por role
    if (params.role) {
      query = query.where("user.role = :role", { role: params.role });
    }

    // Ordenação caso o paremetro for passado
    if (params.sortBy && params.order) {
      query = query.orderBy(
        `user.${params.sortBy}`,
        params.order.toUpperCase() as "ASC" | "DESC"
      );
    }

    return await query.getMany();
  }

  async create(user: User): Promise<User> {
    const created = this.repo.create(user);
    const saved = await this.repo.save(created);
    return saved;
  }

  async findById(userId: string): Promise<User | null> {
    const found = await this.repo.findOneBy({ id: userId });
    return found || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.repo.findOneBy({ email });
    return found || null;
  }

  async registerLogin(userId: string) {
    const foundUser = await this.repo.findOne({ where: { id: userId } }); // Encontra o usuário pelo ID
    const now = new Date();

    const saved = await this.repo.save({ ...foundUser, lastLogin: now });

    return saved; // Retorna o usuário atualizado
  }
}
