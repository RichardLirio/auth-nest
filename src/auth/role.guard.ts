import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { UserPayload } from "./jwt.strategy";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtém as roles permitidas dos metadados
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Método do controlador
        context.getClass(), // Classe do controlador
      ]
    );

    // Se não houver roles definidas, permite o acesso (opcional)
    if (!requiredRoles) {
      return true;
    }

    // Obtém o usuário do request (injetado pelo JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    user as UserPayload;

    // Verifica se o usuário está autenticado e tem uma role
    if (!user || !user.role) {
      throw new ForbiddenException("User role not found");
    }

    // Verifica se a role do usuário está nas roles permitidas
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
