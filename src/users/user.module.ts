import { Module } from "@nestjs/common";
import { UserRepository } from "./domain/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { CreateUserController } from "./http/create-user.controller";
import { CreateUserUseCase } from "./application/use-cases/create-user";
import { TypeOrmUserRepository } from "@/database/typeOrm/repositories/user-typeorm-repository";
import { AuthenticateController } from "./http/auth.controller";
import { AuthenticateUseCase } from "./application/use-cases/authenticate-user";
import { FetchUsersController } from "./http/fetch-users.controller";
import { FetchUsersUseCase } from "./application/use-cases/fetch-users";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [
    CreateUserController,
    AuthenticateController,
    FetchUsersController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUseCase,
    FetchUsersUseCase,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UsersModule {}
