/**
 * ARCHIVO: prisma.service.ts
 * OBJETIVO: Servicio singleton centralizado para acceso a base de datos PostgreSQL.
 * CONTENIDO: Extiende PrismaClient con pool de conexiones nativo de pg.
 * POOL DE CONEXIONES: Usa @prisma/adapter-pg para mejor manejo de conexiones en produccion.
 * LIFECYCLE:
 *   - constructor(): Crea Pool con DATABASE_URL, lo pasa como adapter a PrismaClient.
 *   - onModuleInit(): Se ejecuta al iniciar modulo, abre conexion con $connect().
 *   - onModuleDestroy(): Se ejecuta al cerrar app, cierra conexion con $disconnect().
 * VENTAJA POOL: Reutiliza conexiones en lugar de crear nuevas por query.
 * GLOBAL: Decorador @Global() permite inyectar sin importar PrismaModule en cada modulo.
 * USO: Todos los servicios inyectan PrismaService para queries a BD.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Pool nativo de pg para administrar conexiones de forma eficiente.
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    // Adaptador que conecta Prisma con el pool de postgres.
    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    // Abre conexion al iniciar el modulo.
    await this.$connect();
  }

  async onModuleDestroy() {
    // Cierra conexion al detener la app para evitar fugas.
    await this.$disconnect();
  }
}
