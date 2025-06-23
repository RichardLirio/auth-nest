import { ApiProperty } from "@nestjs/swagger";
import { UserResponseSwaggerDto } from "./fetch-user.swagger.dto";

export class UpdateUserResponseDto {
  @ApiProperty({
    description: "Updated user profile data",
    type: UserResponseSwaggerDto,
  })
  user: UserResponseSwaggerDto;
}

export class UpdateUserDTOSwagger {
  @ApiProperty({
    description: "User name",
    example: "John Doe",
    required: false,
    minLength: 1,
  })
  name?: string;

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
    required: false,
    format: "email",
  })
  email?: string;

  @ApiProperty({
    description: "User password",
    example: "secure123",
    required: false,
    minLength: 6,
  })
  password?: string;

  @ApiProperty({
    description: "User role",
    example: "user",
    required: false,
    enum: ["admin", "user"],
  })
  role?: "admin" | "user";
}
