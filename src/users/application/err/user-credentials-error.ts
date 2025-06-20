export class UserCredentialsError extends Error {
  constructor() {
    super("Invalid credentials provided."); // Mensagem de erro personalizada
  }
}
