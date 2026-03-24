/**
 * ARCHIVO: roles.guard.ts
 * OBJETIVO: Guard que valida que el usuario autenticado tenga el rol requerido para acceder a endpoint.
 * FLUJO DE VALIDACION:
 *   1. Obtiene decorador @Roles(...roles) del handler (controller method).
 *   2. Si no hay @Roles definido, permite acceso automaticamente (permite que JwtAuthGuard decide).
 *   3. Si hay @Roles, extrae el role del usuario del JWT (request.user.role).
 *   4. Compara role del usuario con roles permitidos.
 *   5. Si coincide, permite acceso. Si no, lanza 403 Forbidden.
 * MATRIZ DE ROLES:
 *   - Role.ADMIN: Acceso total, puede usar @Roles(Role.ADMIN).
 *   - Role.MANAGER: Creacion/lectura de productos, puede usar @Roles(Role.MANAGER, Role.ADMIN).
 *   - Role.USER: Solo lectura, puede usar @Roles(Role.USER, Role.MANAGER, Role.ADMIN).
 * USO TIPICO: @Roles(Role.ADMIN) en metodos de eliminacion o cambio de rol.
 * DEPENDENCIAS: Reflector (para leer @Roles), Request (para obtener user).
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../constants/auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lee los roles requeridos desde @Roles() en metodo/controlador.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay restriccion declarada, permite continuar.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { role?: Role };
    }>();
    const user = request.user;

    // Deniega si el usuario autenticado no trae rol.
    if (!user?.role) {
      return false;
    }

    // Autoriza solo si el rol del usuario esta en la lista requerida.
    return requiredRoles.includes(user.role);
  }
}
