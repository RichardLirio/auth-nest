export class UserEmailConflictError extends Error {
  constructor() {
    super("User Email already exist."); // Mensagem de erro personalizada
  }
}
