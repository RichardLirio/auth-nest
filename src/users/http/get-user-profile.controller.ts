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
import { GetUserProfileUseCase } from "@/users/application/use-cases/get-user-profile";
import { CurrentUser } from "@/auth/decorator/current-user-decorator";
import { UserPayload } from "@/auth/strategy/jwt.strategy";
import {
  ErrorResponseDto,
  GetUserProfileResponseDto,
} from "@/users/dtos/get-user-profile.swagger.dto";
import { UserNotExists } from "@/users/application/err/user-not-exists-error";

const getUserParamsSchema = z.string().uuid().optional();

const paramValidationPipe = new ZodValidationPipe(getUserParamsSchema);

type GetUserParamsSchema = z.infer<typeof getUserParamsSchema>;

@ApiTags("Users")
@Controller("user")
@ApiTags("Users")
export class GetUserProfileController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth("JWT-auth")
  @Roles("admin", "user")
  @HttpCode(200)
  @ApiOperation({
    summary: "Obter o perfil do usuário autenticado",
    description: "Retorna os dados do próprio usuário autenticado.",
  })
  @ApiResponse({
    status: 200,
    description: "Perfil do usuário retornado com sucesso",
    type: GetUserProfileResponseDto,
  })
  async getOwnProfile(@CurrentUser() userReq: UserPayload) {
    const { user } = await this.getUserProfileUseCase.execute({
      userId: userReq.sub,
    });
    return { user };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth("JWT-auth")
  @Roles("admin", "user")
  @HttpCode(200)
  @ApiOperation({
    summary: "Obter dados de outro usuário pelo ID",
    description:
      "Retorna o perfil de um usuário específico. Somente administradores podem acessar perfis de outros usuários.",
  })
  @ApiParam({
    name: "id",
    description: "UUID do usuário",
    example: "123e4567-e89b-12d3-a456-426614174000",
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
  async getById(
    @CurrentUser() userReq: UserPayload,
    @Param("id", new ZodValidationPipe(z.string().uuid())) id: string
  ) {
    if (userReq.role === "user" && id !== userReq.sub) {
      throw new ForbiddenException("Insufficient permissions");
    }

    try {
      const { user } = await this.getUserProfileUseCase.execute({ userId: id });
      return { user };
    } catch (error) {
      if (error instanceof UserNotExists) {
        throw new NotFoundException(error.message);
      }
    }
  }
}
