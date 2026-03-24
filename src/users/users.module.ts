/**
 * ARCHIVO: users.module.ts
 * OBJETIVO: Modulo encapsulador de dominio de usuarios (creacion, busqueda, rol management).
 * CONTENIDO:
 *   - UsersService: Logica de almacenamiento, busqueda, cambio de rol.
 * IMPORTS:
 *   - PrismaModule: Accede a BD para queries de usuario.
 * PROVIDERS:
 *   - UsersService: Instancia que maneja logica de creacion, busqueda y cambio de rol.
 * EXPORTA:
 *   - UsersService (importado por AuthModule para registro/login).
 *   - Permite que AuthController use UsersService para cambiar rol.
 * NO TIENE CONTROLLER: Los endpoints de usuario estan en AuthController (@Roles(Role.ADMIN)).
 * RESPONSABILIDADES DELEGADAS:
 *   - Crear usuario: AuthService.register() + UsersService.create().
 *   - Buscar usuario: AuthService.validateUser() + UsersService.findByEmail().
 *   - Cambio de rol: AuthController.changeUserRole() + UsersService.updateRole().
 * SEGURIDAD: Password siempre hasheado, nunca retornado en respuestas.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';

@Module({
  // Usa PrismaService para operaciones de persistencia de usuarios.
  imports: [PrismaModule],
  providers: [UsersService],
  // Exporta UsersService para ser consumido por AuthModule.
  exports: [UsersService],
})
export class UsersModule {}
