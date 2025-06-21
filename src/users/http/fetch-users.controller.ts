import {
  Controller,
  Get,
  HttpCode,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guard/jwt-auth.guard";
import { RoleGuard } from "@/auth/guard/role.guard";
import { Roles } from "@/auth/decorator/roles.decorator";
import { z } from "zod";
import { FetchUsersUseCase } from "../application/use-cases/fetch-users";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { FetchUsersResponseSwaggerDto } from "../dtos/fetch-user.swagger.dto";

const fetchUsersQueryParams = z.object({
  role: z.enum(["user", "admin"]).optional(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

type FetchUsersQueryParams = z.infer<typeof fetchUsersQueryParams>;

@ApiTags("Users")
@Controller("users")
export class FetchUsersController {
  constructor(private readonly fetchUsersUseCase: FetchUsersUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles("admin")
  @ApiBearerAuth("JWT-auth")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(fetchUsersQueryParams))
  @ApiOperation({
    summary:
      "Listar usuários com filtros e ordenação. (Somente usuários 'admin' possuem acesso)",
  })
  @ApiQuery({
    name: "role",
    required: false,
    enum: ["user", "admin"],
    description: "Filtrar por papel (ex.: admin, user)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["name", "createdAt"],
    description: "Ordenar por campo",
  })
  @ApiQuery({
    name: "order",
    required: false,
    enum: ["asc", "desc"],
    description: "Ordem de classificação",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuários retornada com sucesso.",
    type: FetchUsersResponseSwaggerDto,
  })
  @ApiUnauthorizedResponse({
    description: "Token JWT não fornecido ou inválido.",
  })
  @ApiForbiddenResponse({
    description: "Usuário não possui permissão (role inadequada).",
  })
  async fetch(@Query() query: FetchUsersQueryParams) {
    const { users } = await this.fetchUsersUseCase.execute(query);
    return { users };
  }
}
