/**
 * ARCHIVO: jwt-payload.interface.ts
 * OBJETIVO: Definir la estructura del payload (contenido) de un token JWT.
 * CONTENIDO: Interfaz TypeScript que tipifica los datos firmados en el JWT.
 * CAMPOS:
 *   - sub (subject): ID del usuario (uuid), identificador unico.
 *   - email: Email del usuario, para contacto/identificacion rápida.
 *   - role: Enum Role (ADMIN, MANAGER, USER), define nivel de acceso.
 * CASO DE USO: Utilizada en:
 *   - auth.service.ts: signAccessToken() firma usando este payload.
 *   - jwt.strategy.ts: validate() mapea el payload a request.user.
 *   - Guards: Acceden a role desde request.user para autorizar rutas.
 * FLUJO: Payload -> Firma JWT -> Extrae Bearer -> Valida firma -> Descodifica -> Disponible en request.user.
 */
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
