import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation-pipe";
import { CreateUserUseCase } from "../application/use-cases/create-user";
import { UserEmailConflictError } from "../application/err/user-email-already-exist-error";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import {
  CreateUserSwaggerDto,
  CreateUserResponseSwaggerDto,
  ErrorResponseSwaggerDto,
  ErrorZodResponseSwaggerDto,
} from "../dtos/create-user.swagger.dto";

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

@ApiTags("Users")
@Controller("users")
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  @ApiOperation({ summary: "Cria um novo usuário" })
  @ApiBody({ type: CreateUserSwaggerDto })
  @ApiResponse({
    status: 201,
    description: "Usuário criado com sucesso",
    type: CreateUserResponseSwaggerDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: Email já está em uso",
    type: ErrorResponseSwaggerDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos no corpo da requisição",
    type: ErrorZodResponseSwaggerDto,
  })
  async create(@Body() body: CreateUserBodySchema) {
    const { name, email, password, role } = body;
    try {
      await this.createUserUseCase.execute({
        name,
        email,
        password,
        role,
      });
      return { message: "User created successfully" };
    } catch (error) {
      if (error instanceof UserEmailConflictError) {
        throw new ConflictException(
          "User with same e-mail address already exists."
        );
      }
      throw error;
    }
  }
}
