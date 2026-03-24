/**
 * ARCHIVO: jwt-auth.guard.ts
 * OBJETIVO: Guard NestJS que valida presencia y validez de JWT en toda peticion HTTP.
 * FLUJO DE VALIDACION:
 *   1. Extrae token del header Authorization: Bearer <token>.
 *   2. Si token invalido o expirado, lanza 401 Unauthorized.
 *   3. Si valido, extrae payload (sub, email, role) y asigna a request.user.
 *   4. Permite que request prosiga al controller.
 * BYPASS AUTOMATICO: Si endpoint tiene decorador @Public(), el guard es saltado (no valida JWT).
 *   - Usado en /auth/register y /auth/login para permitir publicos.
 * ROLES: El payload incluye 'role' que es verificado por RolesGuard (ejecuta despues).
 * SEGURIDAD: Usa estrategia JWT (jwt.strategy.ts) para firmar/verificar con secreto del .env.
 * DEPENDENCIAS: Reflector (para detectar @Public), JwtService (para validar), Request.
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Permite saltar autenticacion en handlers marcados con @Public().
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Para el resto de rutas aplica validacion JWT estandar de Passport.
    return super.canActivate(context);
  }
}
