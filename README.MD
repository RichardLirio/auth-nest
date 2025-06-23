# User Authentication API

This project is a NestJS-based backend API for user management and authentication, utilizing TypeORM for database operations and JWT for secure authentication. Below are the setup instructions, configuration details, key functionalities of the API, and the project structure.


## Prerequisites

- Node.js (v18 or higher)
- npm
- PostgreSQL
- OpenSSL (for generating JWT keys in production)
- Docker (optional, for running PostgreSQL via Docker)

## Setup Instructions

### 1. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   - Linux/macOS:
     ```bash
     cp .env.example .env
     ```
   - Windows:
     ```cmd
     copy .env.example .env
     ```

2. Update the `.env` file with your database credentials and other configurations. Example:
   ```env
   PORT=3333
   DATABASE_USER=root
   DATABASE_PASSWORD=randompassword
   DATABASE_DB=mydb
   DATABASE_URL="postgresql://root:randompassword@localhost:5432/mydb?schema=public"
   VERSION=1
   JWT_PRIVATE_KEY=<base64-encoded-private-key>
   JWT_PUBLIC_KEY=<base64-encoded-public-key>
   CORS_ALLOWED_ORIGINS=http://localhost:3333,http://localhost:5173
   ```

   **Note**: The JWT keys in `.env.example` are for testing only. For production, generate new keys (see [JWT Key Configuration](#jwt-key-configuration)).

### 2. Install Dependencies

Run the following command to install project dependencies:
```bash
npm install
```

### 3. Set Up PostgreSQL

You can use a local PostgreSQL instance or run one via Docker.

#### Option 1: Local PostgreSQL
- Ensure PostgreSQL is installed and running.
- Create a database matching the `DATABASE_DB` value in `.env`.
- Update `DATABASE_URL` with your database credentials.

#### Option 2: Docker
Run the PostgreSQL container using Docker Compose:
```bash
docker-compose up -d
```

This uses the configuration in `docker-compose.yml` to create a PostgreSQL container with the specified user, password, and database.

### 4. Run Migrations

Create and apply database migrations to set up the schema:
```bash
npm run migration:create --name=user-table
npm run migration:generate --name=user-table
npm run migration:run
```

This creates the `users` table with fields for `id`, `name`, `email`, `password`, `role`, `lastLogin`, `createdAt`, and `updatedAt`.

### 5. Start the Application

Run the application in development mode:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3333/api/v1` (or the port specified in `.env`).

## Running Tests

- **Unit Tests**:
  ```bash
  npm run test
  ```
- **End-to-End (E2E) Tests** (requires the API to be running):
  ```bash
  npm run test:e2e
  ```

## API Configuration

All API routes use a global prefix in the format `/api/v<version>`, where `version` is defined by the `VERSION` variable in `.env` (default: `1`, e.g., `/api/v1/users`).

To change the API version:
1. Edit the `.env` file:
   ```env
   VERSION=2
   ```

### Swagger Documentation

API documentation is available via Swagger at `/docs` (e.g., `http://localhost:3333/docs`). It includes detailed descriptions of endpoints, request/response schemas, and authentication instructions.

### CORS Configuration

CORS is enabled for origins specified in `CORS_ALLOWED_ORIGINS` in `.env`. Example:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3333,http://localhost:5173
```

## JWT Key Configuration

This project uses the RS256 algorithm for JWT generation and verification due to its security and scalability benefits.

### Why RS256?

- **Asymmetric Security**: Uses a private key for signing and a public key for verification, ensuring only the service with the private key can generate valid tokens.
- **Scalability**: The public key can be shared with other services for token verification, ideal for distributed systems.
- **Robustness**: More secure than symmetric algorithms like HS256, as the private key is not shared.

### Generating JWT Keys

#### For Testing
The `.env.example` file includes sample JWT keys for testing. Copy them to `.env` as described in [Setup Instructions](#setup-instructions).

**Warning**: Do not use these keys in production.

#### For Production
1. Install OpenSSL:
   - Linux/macOS: Usually pre-installed. Verify with `openssl version`.
   - Windows: Download from [Win32 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html) and add the `bin` directory to your `Path`.

2. Generate keys:
   ```bash
   openssl genrsa -out private_key.pem 2048
   openssl rsa -pubout -in private_key.pem -out public_key.pem
   ```

3. Convert to Base64:
   - Linux/macOS:
     ```bash
     base64 -i private_key.pem -o private_key_base64.txt
     base64 -i public_key.pem -o public_key_base64.txt
     ```
   - Windows (PowerShell):
     ```powershell
     powershell -Command "$privateKeyBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes('private_key.pem')); $privateKeyBase64 | Out-File -FilePath private_key_base64.txt -Encoding ASCII"
     powershell -Command "$publicKeyBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes('public_key.pem')); $publicKeyBase64 | Out-File -FilePath public_key_base64.txt -Encoding ASCII"
     ```

4. Add to `.env`:
   ```env
   JWT_PRIVATE_KEY=<content of private_key_base64.txt>
   JWT_PUBLIC_KEY=<content of public_key_base64.txt>
   ```

5. Clean up temporary files:
   - Linux/macOS:
     ```bash
     rm private_key.pem public_key.pem private_key_base64.txt public_key_base64.txt
     ```
   - Windows:
     ```cmd
     del private_key.pem public_key.pem private_key_base64.txt public_key_base64.txt
     ```

### Security Notes
- Ensure `.env` is listed in `.gitignore` to prevent committing sensitive data.
- Keep the private key secure and never share it.
- The public key can be shared with services needing to verify JWTs.

## Project Structure

The project follows a modular structure for maintainability and scalability. Below is the directory layout:

```
├── .env.example                       # Example environment variables file
├── .gitignore                         # Git ignore file
├── README.md                          # Project documentation
├── docker-compose.yml                 # Docker configuration for PostgreSQL
├── nest-cli.json                      # NestJS CLI configuration
├── package-lock.json                  # NPM lock file
├── package.json                       # Project dependencies and scripts
├── src
│   ├── app.module.ts                  # Root module of the application
│   ├── auth
│   │   ├── auth.module.ts             # Authentication module
│   │   ├── decorator
│   │   │   ├── current-user-decorator.ts  # Decorator for accessing current user
│   │   │   └── roles.decorator.ts     # Decorator for role-based access control
│   │   ├── guard
│   │   │   ├── jwt-auth.guard.ts      # JWT authentication guard
│   │   │   └── role.guard.ts          # Role-based authorization guard
│   │   └── strategy
│   │       └── jwt.strategy.ts        # JWT strategy for authentication
│   ├── database
│   │   ├── database.module.ts         # Database module configuration
│   │   └── typeOrm
│   │       ├── entities
│   │       │   └── user-entity.ts     # TypeORM user entity
│   │       ├── migrations
│   │       │   └── 1750362417716-user-table.ts  # Migration for user table
│   │       ├── repositories
│   │       │   └── user-typeorm-repository.ts  # TypeORM user repository
│   │       └── typeOrm.migrations-config.ts    # TypeORM migration configuration
│   ├── env.ts                         # Environment variable configuration
│   ├── main.ts                        # Application entry point
│   ├── pipes
│   │   └── zod-validation-pipe.ts     # Zod validation pipe for input validation
│   ├── shared
│   │   └── utils
│   │       └── hash.ts                # Utility for password hashing
│   └── users
│       ├── application
│       │   ├── err
│       │   │   ├── user-credentials-error.ts       # Error for invalid credentials
│       │   │   ├── user-email-already-exist-error.ts  # Error for duplicate email
│       │   │   ├── user-email-not-exist-error.ts   # Error for non-existent email
│       │   │   └── user-not-exists-error.ts        # Error for non-existent user
│       │   └── use-cases
│       │       ├── authenticate.spec.ts            # Tests for authentication use case
│       │       ├── authenticate.ts                 # Authentication use case
│       │       ├── create-user.spec.ts             # Tests for create user use case
│       │       ├── create-user.ts                  # Create user use case
│       │       ├── delete-user.spec.ts             # Tests for delete user use case
│       │       ├── delete-user.ts                  # Delete user use case
│       │       ├── fetch-users.spec.ts             # Tests for fetch users use case
│       │       ├── fetch-users.ts                  # Fetch users use case
│       │       ├── get-user-profile.spec.ts        # Tests for get user profile use case
│       │       ├── get-user-profile.ts             # Get user profile use case
│       │       ├── update-user.spec.ts             # Tests for update user use case
│       │       └── update-user.ts                  # Update user use case
│       ├── domain
│       │   ├── entities
│       │   │   └── user.entity.ts                 # Domain user entity
│       │   └── repositories
│       │       └── user.repository.ts             # User repository interface
│       ├── dtos
│       │   ├── authenticate-user.swagger.dto.ts    # DTO for authentication Swagger
│       │   ├── create-user.swagger.dto.ts          # DTO for create user Swagger
│       │   ├── fetch-user.swagger.dto.ts           # DTO for fetch users Swagger
│       │   ├── get-user-profile.swagger.dto.ts     # DTO for get user profile Swagger
│       │   └── update-user.swagger.dto.ts          # DTO for update user Swagger
│       ├── http
│       │   ├── auth.controller.e2e-spec.ts        # E2E tests for auth controller
│       │   ├── auth.controller.ts                  # Authentication controller
│       │   ├── create-user.controller.e2e-spec.ts  # E2E tests for create user controller
│       │   ├── create-user.controller.ts           # Create user controller
│       │   ├── delete-user.controller.e2e-spec.ts  # E2E tests for delete user controller
│       │   ├── delete-user.controller.ts           # Delete user controller
│       │   ├── fetch-users.controller.e2e-spec.ts  # E2E tests for fetch users controller
│       │   ├── fetch-users.controller.ts           # Fetch users controller
│       │   ├── get-user-profile.controller.e2e-spec.ts  # E2E tests for get user profile controller
│       │   ├── get-user-profile.controller.ts      # Get user profile controller
│       │   ├── update-user.controller.e2e-spec.ts  # E2E tests for update user controller
│       │   └── update-user.controller.ts           # Update user controller
│       └── user.module.ts                         # User module
├── test
│   ├── repositories
│   │   └── in-memory-usuario-repository.ts        # In-memory repository for testing
│   └── setup-e2e.ts                              # E2E test setup
├── tsconfig.build.json                           # TypeScript build configuration
├── tsconfig.json                                 # TypeScript configuration
├── vitest.config.e2e.mts                         # Vitest configuration for E2E tests
└── vitest.config.mts                             # Vitest configuration for unit tests
```


## API Endpoints and Business Rules

### Authentication
- **Endpoint**: `POST /api/v1/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJ..."
  }
  ```
- **Rules**:
  - Validates email and password.
  - Updates `lastLogin` timestamp on successful login.
  - Throws `UserEmailNotFound` if the email is not registered.
  - Throws `UserCredentialsError` if the password is incorrect.

### Create User
- **Endpoint**: `POST /api/v1/users`
- **Description**: Creates a new user.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "123456",
    "role": "user"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```
- **Rules**:
  - Public endpoint (no authentication required).
  - Validates input using Zod.
  - Hashes password using bcryptjs.
  - Throws `UserEmailConflictError` if the email is already registered.
  - Default role is `user` if not specified.

### List Users
- **Endpoint**: `GET /api/v1/users`
- **Description**: Lists all users with optional filtering and sorting.
- **Query Parameters**:
  - `role` (optional): `admin` or `user` (e.g., `?role=admin`)
  - `sortBy` (optional): `name` or `createdAt` (e.g., `?sortBy=name`)
  - `order` (optional): `asc` or `desc` (e.g., `?order=asc`)
- **Response**:
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```
- **Rules**:
  - Requires JWT authentication and `admin` role.
  - Throws `Unauthorized` (401) if no valid token is provided.
  - Throws `Forbidden` (403) if the user is not an admin.
  - Validates query parameters using Zod.
  - Throws `BadRequest` (400) for invalid query parameters.

### Get User Profile
- **Endpoints**:
  - `GET /api/v1/user` (own profile)
  - `GET /api/v1/user/:id` (specific user by ID)
- **Description**: Retrieves a user's profile.
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "lastLogin": "2023-01-02T00:00:00.000Z"
    }
  }
  ```
- **Rules**:
  - Requires JWT authentication.
  - Users can only view their own profile unless they have `admin` role.
  - Admins can view any user's profile.
  - Throws `Unauthorized` (401) if no valid token is provided.
  - Throws `Forbidden` (403) if a non-admin user tries to access another user's profile.
  - Throws `NotFound` (404) if the user does not exist.
  - Validates `id` as a UUID using Zod.

### Update User
- **Endpoint**: `PATCH /api/v1/user/:id`
- **Description**: Updates a user's details.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "newpass123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-03T00:00:00.000Z"
    }
  }
  ```
- **Rules**:
  - Requires JWT authentication.
  - Users can only update their own profile unless they have `admin` role.
  - Non-admin users cannot update their `role`.
  - Admins can update any user's details, including `role`.
  - Validates input using Zod.
  - Hashes new password if provided.
  - Throws `Unauthorized` (401) if no valid token is provided.
  - Throws `Forbidden` (403) if a non-admin user tries to update another user or their role.
  - Throws `NotFound` (404) if the user does not exist.
  - Throws `Conflict` (409) if the new email is already registered.

### Delete User
- **Endpoint**: `DELETE /api/v1/user/:id`
- **Description**: Deletes a user.
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```
- **Rules**:
  - Requires JWT authentication and `admin` role.
  - Only admins can delete users.
  - Throws `Unauthorized` (401) if no valid token is provided.
  - Throws `Forbidden` (403) if the user is not an admin.
  - Throws `NotFound` (404) if the user does not exist.
  - Validates `id` as a UUID using Zod.

## Using Swagger for Authentication

1. **Obtain JWT Token**:
   - Access `POST /api/v1/auth/login` in Swagger.
   - Enter valid credentials (e.g., `{"email": "johndoe@example.com", "password": "123456"}`).
   - Copy the `access_token` from the response.

2. **Authorize Requests**:
   - Click the **Authorize** button in Swagger.
   - Enter `Bearer <access_token>` (e.g., `Bearer eyJ...`).
   - Save to apply the token to protected routes.

3. **Test Protected Routes**:
   - Access routes like `GET /api/v1/users` or `GET /api/v1/user/:id`.
   - The token is automatically included in requests.
   - Expect 401 (Unauthorized) or 403 (Forbidden) errors for invalid tokens or insufficient permissions.

## Security Considerations

- **Environment Variables**: Never commit `.env` to version control. Ensure `.gitignore` includes `.env` and temporary key files.
- **Password Hashing**: Passwords are hashed using bcryptjs with 8 salt rounds.
- **Input Validation**: Uses Zod for robust validation of inputs and query parameters.
- **Authentication**: JWT tokens are signed with RS256 and expire after 24 hours.
- **Authorization**: Role-based access control ensures only authorized users access protected routes.

## Contact

For further details or assistance, consult the Swagger documentation at /docs or reach out to the project maintainer:

- Author: Richard Silva Lirio
- LinkedIn: [Richard Lirio](https://www.linkedin.com/in/richard-silva-lirio-b97484250/)
- GitHub: [RichardLirio](https://github.com/richardlirio)