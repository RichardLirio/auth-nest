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

  async create(user: User): Promise<User> {
    const created = this.repo.create(user);
    const saved = await this.repo.save(created);
    return saved;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.repo.findOneBy({ email });
    return found || null;
  }
}
