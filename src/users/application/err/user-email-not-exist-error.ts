export class UserEmailNotFound extends Error {
  constructor() {
    super("Email not found."); // Mensagem de erro personalizada
  }
}
