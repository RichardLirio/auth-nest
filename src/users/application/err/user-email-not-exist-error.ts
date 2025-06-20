export class UserEmailNotFound extends Error {
  constructor() {
    super("Email not registered"); // Mensagem de erro personalizada
  }
}
