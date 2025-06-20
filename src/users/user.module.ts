// src/users/users.module.ts
import { Module } from "@nestjs/common";
import { UserRepository } from "./domain/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { UsersController } from "./user.controller";
import { CreateUserUseCase } from "./application/use-cases/create-user";
import { TypeOrmUserRepository } from "@/database/typeOrm/repositories/user-typeorm-repository";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UsersModule {}
