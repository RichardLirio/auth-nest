import { ApiProperty } from "@nestjs/swagger";

export class AuthenticateUserSwaggerDto {
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
}

export class AuthenticateUserResponseSwaggerDto {
  @ApiProperty({
    description: "Objeto com token de autenticação.",
    example: "Token de autorização.",
  })
  access_token: string;
}

export class BadRequestErrorResponseSwaggerDto {
  @ApiProperty({
    description: "Código de status do erro",
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    description: "Mensagem de erro",
    example: "Email not registered",
  })
  message: string;

  @ApiProperty({
    description: "Tipo de erro",
    example: "ConflictException",
  })
  error: string;
}

export class CredentialsErrorResponseSwaggerDto {
  @ApiProperty({
    description: "Código de status do erro",
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: "Mensagem de erro",
    example: "Invalid credentials provided.",
  })
  message: string;

  @ApiProperty({
    description: "Tipo de erro",
    example: "UnauthorizedException",
  })
  error: string;
}
