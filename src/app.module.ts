/**
 * ARCHIVO: app.module.ts
 * OBJETIVO: Modulo raiz que agrupa toda la aplicacion y sus dependencias.
 * CONTENIDO: Importa y configura modulos principales (Config, Prisma, Users, Auth, Products).
 * MODULOS IMPORTADOS:
 *   - ConfigModule: Carga .env variables globalmente, una sola vez.
 *   - PrismaModule: Global, proporciona acceso a BD a toda la app.
 *   - UsersModule: Dominio de usuarios, logica de creacion/busqueda.
 *   - AuthModule: Autenticacion JWT, guards y estrategias.
 *   - ProductsModule: Dominio de productos, CRUD y soft delete.
 * ORDEN IMPORTA: Se cargan en orden logico para resolver dependencias (Prisma primero, Auth luego).
 * CONTROLLERS: AppController (health checks basicos).
 * PROVIDERS: AppService (logica transversal si es necesaria).
 * VENTAJA: Separacion por dominios permite crecimiento escalable del proyecto.
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Carga variables de entorno una sola vez para toda la aplicacion.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Acceso a base de datos.
    PrismaModule,
    // Dominio de usuarios y reglas relacionadas.
    UsersModule,
    // Autenticacion JWT y autorizacion por roles.
    AuthModule,
    // Modulo de negocio de productos.
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
