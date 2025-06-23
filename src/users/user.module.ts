import { Module } from "@nestjs/common";
import { UserRepository } from "./domain/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserOrmEntity } from "@/database/typeOrm/entities/user-entity";
import { CreateUserController } from "./http/create-user.controller";
import { CreateUserUseCase } from "./application/use-cases/create-user";
import { TypeOrmUserRepository } from "@/database/typeOrm/repositories/user-typeorm-repository";
import { AuthenticateController } from "./http/auth.controller";
import { AuthenticateUseCase } from "./application/use-cases/authenticate";
import { FetchUsersController } from "./http/fetch-users.controller";
import { FetchUsersUseCase } from "./application/use-cases/fetch-users";
import { GetUserProfileController } from "./http/get-user-profile.controller";
import { GetUserProfileUseCase } from "./application/use-cases/get-user-profile";
import { DeleteUserController } from "./http/delete-user.controller";
import { DeleteUserUseCase } from "./application/use-cases/delete-user";
import { UpdateUserController } from "./http/update-user.controller";
import { UpdateUserUseCase } from "./application/use-cases/update-user";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [
    CreateUserController,
    AuthenticateController,
    FetchUsersController,
    GetUserProfileController,
    DeleteUserController,
    UpdateUserController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUseCase,
    FetchUsersUseCase,
    GetUserProfileUseCase,
    DeleteUserUseCase,
    UpdateUserUseCase,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UsersModule {}
