export class UserNotExists extends Error {
  constructor() {
    super("User not found"); // Mensagem de erro personalizada
  }
}
