export class UserCredentialsError extends Error {
  constructor() {
    super("Invalid user credentials."); // Mensagem de erro personalizada
  }
}
