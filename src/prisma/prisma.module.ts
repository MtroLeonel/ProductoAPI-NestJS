/**
 * ARCHIVO: prisma.module.ts
 * OBJETIVO: Modulo que exporta PrismaService como global para acceso a BD desde toda la app.
 * CONTENIDO:
 *   - PrismaService: Singleton con PrismaClient pooled.
 * DECORADOR @Global(): Permite inyectar PrismaService sin importar PrismaModule.
 * PROVIDERS: [PrismaService] - Crea la instancia singleton.
 * EXPORTS: [PrismaService] - Disponible en toda la aplicacion.
 * VENTAJA: Centraliza conexion a BD, lifecycle hooks (onModuleInit, onModuleDestroy).
 * USO: Todos los servicios (AuthService, ProductsService, UsersService) inyectan PrismaService.
 * POOL: Usa @prisma/adapter-pg para connectionPool nativo, reutiliza conexiones.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  // Export global para evitar importar PrismaModule en cada modulo.
  exports: [PrismaService],
})
export class PrismaModule {}
