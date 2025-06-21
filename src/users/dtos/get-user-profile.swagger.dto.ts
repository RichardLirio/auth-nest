import { ApiProperty } from "@nestjs/swagger";
import { UserResponseSwaggerDto } from "./fetch-user.swagger.dto";

// DTO for successful response
export class GetUserProfileResponseDto {
  @ApiProperty({
    description: "User profile data",
    type: UserResponseSwaggerDto,
  })
  user: UserResponseSwaggerDto;
}

// DTO for error responses
export class ErrorResponseDto {
  @ApiProperty({
    description: "HTTP status code",
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: "Error message",
    example: "Validation failed: Invalid UUID format",
  })
  message: string;

  @ApiProperty({
    description: "Error type",
    example: "Bad Request",
  })
  error: string;
}
