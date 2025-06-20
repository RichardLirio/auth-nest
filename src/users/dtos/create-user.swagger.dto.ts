import { ApiProperty } from "@nestjs/swagger";

export class CreateUserSwaggerDto {
  @ApiProperty({
    description: "Nome completo do usuário",
    example: "John Doe",
    type: String,
  })
  name: string;

  @ApiProperty({
    description: "Endereço de email do usuário",
    example: "johndoe@example.com",
    type: String,
  })
  email: string;

  @ApiProperty({
    description: "Senha do usuário (mínimo 6 caracteres)",
    example: "123456",
    type: String,
    minLength: 6,
  })
  password: string;

  @ApiProperty({
    description: "Papel do usuário no sistema",
    enum: ["user", "admin"],
    default: "user",
    example: "user",
  })
  role: "user" | "admin";
}

export class CreateUserResponseSwaggerDto {
  @ApiProperty({
    description: "Código de status do sucesso",
    example: "User created successfully",
  })
  message: string;
}

export class ErrorResponseSwaggerDto {
  @ApiProperty({
    description: "Código de status do erro",
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    description: "Mensagem de erro",
    example: "User with same e-mail address already exists.",
  })
  message: string;

  @ApiProperty({
    description: "Tipo de erro",
    example: "ConflictException",
  })
  error: string;
}

export class ErrorZodResponseSwaggerDto {
  @ApiProperty({
    description: "Código de status do erro",
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: "Mensagem de erro",
    example: "Validation failed",
  })
  message: string;

  @ApiProperty({
    description: "Tipo de erro",
    example: "ZodValidationError",
  })
  error: string;
}
