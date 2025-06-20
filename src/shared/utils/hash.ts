import { hash } from "bcryptjs";

export async function hashPassword(password: string) {
  return await hash(password, 8); // realiza um hash na senha do usuario para salvar no banco de dados, 8 saltos
}
