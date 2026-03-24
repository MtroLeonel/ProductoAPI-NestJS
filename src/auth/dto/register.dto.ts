/**
 * ARCHIVO: register.dto.ts
 * OBJETIVO: Validar y tipificar el body del endpoint POST /auth/register.
 * CONTENIDO: DTO que define estructura esperada al registrar un nuevo usuario.
 * CAMPOS Y VALIDACIONES:
 *   - email: Debe ser un email valido.
 *   - password: String minimo 8 caracteres.
 *   - role (opcional): Si se proporciona, debe ser ADMIN, MANAGER o USER. Default: USER (asignado en service).
 * CASO DE USO: Route handler register(@Body() registerDto: RegisterDto).
 *   Flujo: Cliente envia {email, password, role?} -> Validacion -> auth.service.register() -> Crea usuario + JWT.
 * DIFERENCIA CON LOGIN: register permite especificar rol opcional; login solo requiere email/password.
 * VALOR AGREGADO: Tipado TypeScript + validaciones aseguran datos validos ante de procesarse.
 */
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El email no es valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La password debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol invalido' })
  role?: Role;
}
