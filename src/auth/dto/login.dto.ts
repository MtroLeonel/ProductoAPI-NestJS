/**
 * ARCHIVO: login.dto.ts
 * OBJETIVO: Validar y tipificar el body del endpoint POST /auth/login.
 * CONTENIDO: DTO (Data Transfer Object) que define estructura esperada para login.
 * CAMPOS Y VALIDACIONES:
 *   - email: Debe ser un email valido (ej: user@example.com).
 *   - password: String minimo 8 caracteres (nunca se valida en servidor, se compara con bcrypt hash).
 * CASO DE USO: Route handler en auth.controller.ts recibe LoginDto tipado.
 *   Ejemplo: login(@Body() loginDto: LoginDto) -> auth.service.validateUser(email, password).
 * FLUJO: Cliente envia {email, password} -> ValidationPipe valida usando LoginDto -> Service recibe tipado.
 * VALOR AGREGADO: TypeScript tipado + validaciones automaticas evitan datos invalidos.
 */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La password debe tener al menos 8 caracteres' })
  password: string;
}
