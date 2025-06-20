import { ApiProperty } from "@nestjs/swagger";

export class UserResponseSwaggerDto {
  @ApiProperty({
    description: "Identificador único do usuário",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Nome do usuário",
    example: "John Doe",
  })
  name: string;

  @ApiProperty({
    description: "Email do usuário",
    example: "john.doe@example.com",
  })
  email: string;

  @ApiProperty({
    description: "Papel do usuário",
    enum: ["user", "admin"],
    example: "user",
  })
  role: string;

  @ApiProperty({
    description: "Data de criação do usuário",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data da última atualização do usuário",
    example: "2023-01-01T00:00:00.000Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Data do último login do usuário",
    example: "2023-01-02T00:00:00.000Z",
    required: false,
  })
  lastLogin?: Date;
}

export class FetchUsersResponseSwaggerDto {
  @ApiProperty({
    description: "Lista de usuários",
    type: [UserResponseSwaggerDto],
  })
  users: UserResponseSwaggerDto[];
}
