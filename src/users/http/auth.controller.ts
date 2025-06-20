import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { AuthenticateUseCase } from "@/users/application/use-cases/authenticate-user";
import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { UserEmailNotFound } from "../application/err/user-email-not-exist-error";
import { UserCredentialsError } from "../application/err/user-credentials-error";
import {
  AuthenticateUserResponseSwaggerDto,
  AuthenticateUserSwaggerDto,
  BadRequestErrorResponseSwaggerDto,
  CredentialsErrorResponseSwaggerDto,
} from "../dtos/authenticate-user.swagger.dto";
import {
  ErrorResponseSwaggerDto,
  ErrorZodResponseSwaggerDto,
} from "../dtos/create-user.swagger.dto";

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@ApiTags("Users")
@Controller("/sessions")
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private readonly authUserUseCase: AuthenticateUseCase
  ) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  @ApiOperation({ summary: "Autenticar usuário" })
  @ApiBody({ type: AuthenticateUserSwaggerDto })
  @ApiResponse({
    status: 200,
    description: "Usuário autenticado com sucesso",
    type: AuthenticateUserResponseSwaggerDto,
  })
  @ApiResponse({
    status: 409,
    description: "Email não registrado.",
    type: BadRequestErrorResponseSwaggerDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos no corpo da requisição",
    type: ErrorZodResponseSwaggerDto,
  })
  @ApiResponse({
    status: 401,
    description: "Credenciais incorretas.",
    type: CredentialsErrorResponseSwaggerDto,
  })
  async auth(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body;
    try {
      const { user } = await this.authUserUseCase.execute({
        email,
        password,
      });

      if (user) {
        const accessToken = this.jwt.sign({ sub: user.id, role: user.role });

        return { access_token: accessToken };
      }
    } catch (error) {
      if (error instanceof UserEmailNotFound) {
        throw new ConflictException(error.message);
      }
      if (error instanceof UserCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
    }
  }
}
