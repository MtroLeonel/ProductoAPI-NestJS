/**
 * ARCHIVO: change-user-role.dto.ts
 * OBJETIVO: Validar y tipificar el body del endpoint PATCH /auth/users/:id/role.
 * CONTENIDO: DTO minimalista que solo valida el nuevo rol a asignar.
 * CAMPOS Y VALIDACIONES:
 *   - role (requerido): Debe ser ADMIN, MANAGER o USER (validado con IsEnum).
 * CASO DE USO: Solo ADMIN puede ejecutar este endpoint (protegido con @Roles(Role.ADMIN)).
 *   Flujo: ADMIN envia {role: 'MANAGER'} -> Validacion -> auth.controller.updateRole() -> users.service.updateRole().
 * VALOR AGREGADO: Interfaz clara para cambios de rol e impone validaciones de enum.
 */
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeUserRoleDto {
  @IsEnum(Role, { message: 'Rol invalido' })
  role: Role;
}
