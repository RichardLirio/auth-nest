import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { CreateUserUseCase } from "./application/use-cases/create-user";
import { UserEmailConflictError } from "./application/err/user-email-already-exist-error";

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

@Controller("users")
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async create(@Body() body: CreateUserBodySchema) {
    const { name, email, password, role } = body;
    try {
      await this.createUserUseCase.execute({
        name,
        email,
        password,
        role,
      });
    } catch (error) {
      if (error instanceof UserEmailConflictError) {
        throw new ConflictException( //lança um erro feito pelo nest para conflitos {erro,status code 409, message}
          "User with same e-mail address already exists."
        );
      }
    }
  }
}
