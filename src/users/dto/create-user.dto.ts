/**
 * ARCHIVO: create-user.dto.ts
 * OBJETIVO: Validar y tipificar los datos al crear un nuevo usuario (solo para admin/sistema).
 * CONTENIDO: DTO identico a RegisterDto, utilizado internamente por UsersService.
 * CAMPOS Y VALIDACIONES:
 *   - email (requerido): Debe ser email valido, se normaliza a minusculas en service.
 *   - password (requerido): String minimo 8 caracteres, se hashea con bcrypt en service.
 *   - role (opcional): ADMIN, MANAGER o USER. Default: USER si no se especifica.
 * CASO DE USO: Utilizado en registro (@POST /auth/register) y creacion de usuarios administrativos.
 * FLUJO: RegisterDto/CreateUserDto -> UsersService.create() -> Hash password -> Guardar en BD.
 * VALOR AGREGADO: Interfaz clara para creacion de usuarios con validaciones integradas.
 */
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no es valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La password debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol invalido' })
  role?: Role;
}
