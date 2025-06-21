export class UserNotExists extends Error {
  constructor() {
    super("Requested resource not found."); // Mensagem de erro personalizada
  }
}
