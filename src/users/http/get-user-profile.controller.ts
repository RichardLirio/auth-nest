import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guard/jwt-auth.guard";
import { RoleGuard } from "@/auth/guard/role.guard";
import { Roles } from "@/auth/decorator/roles.decorator";
import { z } from "zod";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { GetUserProfileUseCase } from "../application/use-cases/get-user-profile";
import { CurrentUser } from "@/auth/decorator/current-user-decorator";
import { UserPayload } from "@/auth/strategy/jwt.strategy";
import {
  ErrorResponseDto,
  GetUserProfileResponseDto,
} from "../dtos/get-user-profile.swagger.dto";
import { UserNotExists } from "../application/err/user-not-exists-error";

const getUserParamsSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(getUserParamsSchema);

type GetUserParamsSchema = z.infer<typeof getUserParamsSchema>;

@ApiTags("Users")
@Controller("user/:id")
export class GetUserProfileController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth("JWT-auth")
  @Roles("admin", "user")
  @HttpCode(200)
  @ApiOperation({
    summary: "Obter dados de um único usuário pelo ID",
    description:
      "Retorna o perfil de um usuário específico. Administradores podem acessar qualquer perfil, enquanto usuários só podem acessar o próprio perfil.",
  })
  @ApiParam({
    name: "id",
    description: "ID do usuário no formato UUID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Perfil do usuário retornado com sucesso",
    type: GetUserProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: "ID fornecido é inválido (formato UUID incorreto)",
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Token JWT não fornecido ou inválido",
  })
  @ApiForbiddenResponse({
    description:
      "Usuário não possui permissão para acessar o perfil solicitado",
  })
  async Get(
    @CurrentUser() userReq: UserPayload,
    @Param("id", paramValidationPipe) id: GetUserParamsSchema
  ) {
    if (userReq.role === "user" && id != userReq.sub) {
      throw new ForbiddenException("Insufficient permissions");
    } // se o usuario da requisição for user e o id solicitado for diferete do dele retorna erro
    try {
      const { user } = await this.getUserProfileUseCase.execute({
        userId: id,
      });
      return { user };
    } catch (error) {
      if (error instanceof UserNotExists) {
        throw new NotFoundException(error.message);
      }
    }
  }
}
