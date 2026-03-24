/**
 * ARCHIVO: roles.decorator.ts
 * OBJETIVO: Proporcionar un decorador para especificar roles requeridos en un handler.
 * CONTENIDO: Define el decorador @Roles(...) usando NestJS SetMetadata.
 * PARAMETROS: Acepta uno o mas roles (Role.ADMIN, Role.MANAGER, Role.USER).
 * CASO DE USO: Coloca @Roles(Role.ADMIN) en handlers para restringir acceso.
 *   Ejemplo: @Roles(Role.ADMIN) @Delete(':id') remove(@Param('id') id: string) { ... }
 * VALOR AGREGADO: El RolesGuard verifica ROLES_KEY y compara el rol del usuario contra la lista requerida.
 * FLUJO: Decorador almacena roles -> RolesGuard los lee -> Valida rol de request.user.
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../constants/auth.constants';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
