/**
 * ARCHIVO: products.module.ts
 * OBJETIVO: Modulo encapsulador de dominio de productos (CRUD y soft delete).
 * CONTENIDO:
 *   - ProductsController: Endpoints GET/POST/PATCH/DELETE /products.
 *   - ProductsService: Logica de creacion, lectura, actualizacion, soft delete.
 * IMPORTS:
 *   - AuthModule: Accede a guards y decoradores para proteger rutas.
 * PROVIDERS:
 *   - ProductsService: Instancia que maneja logica de BD.
 * EXPORTA: ProductsService (usado por otros modulos si es necesario).
 * GUARDIAS APLICADAS: JwtAuthGuard + RolesGuard a nivel controller para proteger rutas.
 * MATRIZ DE PERMISOS:
 *   - GET /products: Role.USER+
 *   - POST /products: Role.MANAGER+
 *   - PATCH /products/:id: Role.ADMIN
 *   - DELETE /products/:id: Role.ADMIN
 * FLUJO TIPICO: Cliente -> ProductsController -> Valida @Roles -> ProductsService -> PrismaService -> BD.
 */
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Importa auth para usar guards/roles en el controller de productos.
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
