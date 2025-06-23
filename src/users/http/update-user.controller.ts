import {
  Controller,
  Patch,
  Param,
  Body,
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
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guard/jwt-auth.guard";
import { RoleGuard } from "@/auth/guard/role.guard";
import { Roles } from "@/auth/decorator/roles.decorator";
import { z } from "zod";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { UpdateUserUseCase } from "@/users/application/use-cases/update-user";
import { CurrentUser } from "@/auth/decorator/current-user-decorator";
import { UserPayload } from "@/auth/strategy/jwt.strategy";
import { UserNotExists } from "@/users/application/err/user-not-exists-error";
import { ErrorResponseDto } from "@/users/dtos/get-user-profile.swagger.dto";
import {
  UpdateUserDTOSwagger,
  UpdateUserResponseDto,
} from "../dtos/update-user.swagger.dto";

const updateUserParamsSchema = z.string().uuid();

const updateUserBodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "user"]).optional(),
});

const paramValidationPipe = new ZodValidationPipe(updateUserParamsSchema);
const bodyValidationPipe = new ZodValidationPipe(updateUserBodySchema);

type UpdateUserParamsSchema = z.infer<typeof updateUserParamsSchema>;
type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>;

@ApiTags("Users")
@Controller("user/:id")
export class UpdateUserController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {}

  @Patch()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles("admin", "user")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Atualizar dados de um usuário" })
  @ApiBody({ type: UpdateUserDTOSwagger })
  @ApiResponse({
    status: 200,
    description: "Usuário atualizado com sucesso",
    type: UpdateUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: "ID inválido ou dados de entrada inválidos",
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      "Usuário não possui permissão para atualizar o perfil solicitado",
  })
  @ApiUnauthorizedResponse({
    description: "Token JWT não fornecido ou inválido",
  })
  @ApiParam({
    name: "id",
    description: "ID do usuário no formato UUID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: true,
  })
  async update(
    @Param("id", paramValidationPipe) id: UpdateUserParamsSchema,
    @Body(bodyValidationPipe) body: UpdateUserBodySchema,
    @CurrentUser() userReq: UserPayload
  ) {
    if (userReq.role === "user" && id !== userReq.sub) {
      throw new ForbiddenException("Insufficient permissions");
    }
    if (userReq.role === "user" && body.role != undefined) {
      throw new ForbiddenException("Users cannot update their role");
    }
    try {
      const { user } = await this.updateUserUseCase.execute({
        userId: id,
        ...body,
      });
      return { user };
    } catch (error) {
      if (error instanceof UserNotExists) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
