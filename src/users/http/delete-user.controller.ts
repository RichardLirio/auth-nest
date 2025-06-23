import {
  Controller,
  Delete,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guard/jwt-auth.guard";
import { RoleGuard } from "@/auth/guard/role.guard";
import { Roles } from "@/auth/decorator/roles.decorator";
import { z } from "zod";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { DeleteUserUseCase } from "../application/use-cases/delete-user";
import { CurrentUser } from "@/auth/decorator/current-user-decorator";
import { UserPayload } from "@/auth/strategy/jwt.strategy";
import { UserNotExists } from "../application/err/user-not-exists-error";
import { ErrorResponseDto } from "../dtos/get-user-profile.swagger.dto";

const deleteUserParamsSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(deleteUserParamsSchema);

type DeleteUserParamsSchema = z.infer<typeof deleteUserParamsSchema>;

@ApiTags("Users")
@Controller("user/:id")
export class DeleteUserController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  @Delete()
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles("admin", "user")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Deletar um usuário" })
  @ApiBadRequestResponse({
    description: "ID fornecido é inválido (formato UUID incorreto)",
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      "Usuário não possui permissão para acessar o perfil solicitado",
  })
  @ApiUnauthorizedResponse({
    description: "Token JWT não fornecido ou inválido",
  })
  @ApiResponse({ status: 204, description: "Usuário deletado com sucesso" })
  async delete(
    @Param("id", paramValidationPipe) id: DeleteUserParamsSchema,
    @CurrentUser() userReq: UserPayload
  ) {
    if (userReq.role === "user" && id !== userReq.sub) {
      throw new ForbiddenException("Insufficient permissions");
    }
    try {
      await this.deleteUserUseCase.execute({ userId: id });
    } catch (error) {
      if (error instanceof UserNotExists) {
        throw new NotFoundException(error.message);
      }
    }
  }
}
