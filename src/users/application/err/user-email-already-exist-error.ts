export class UserEmailConflictError extends Error {
  constructor() {
    super("User with same e-mail address already exists."); // Mensagem de erro personalizada
  }
}
