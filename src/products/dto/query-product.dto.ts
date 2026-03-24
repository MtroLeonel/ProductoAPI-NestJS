/**
 * ARCHIVO: query-product.dto.ts
 * OBJETIVO: Validar y tipificar los query parameters del endpoint GET /products.
 * CONTENIDO: DTO que define filtros opcionales para buscar productos.
 * CAMPOS Y VALIDACIONES:
 *   - isActive (opcional): Boolean para filtrar activos (true) o inactivos (false).
 *   - search (opcional): String para busqueda insensible a mayusculas en nombre/descripcion.
 * TRANSFORMACIONES: isActive se convierte de string query a boolean.
 * CASO DE USO: Clientes envian GET /products?isActive=true&search=laptop.
 *   products.service.findAll(query) construye dinamicamente el where de Prisma.
 * FLUJO: Query string -> Validacion/Transformacion -> Service filtra BD segun parametros.
 * VALOR AGREGADO: Soporte flexible para filtros sin cargar toda la tabla de MB.
 */
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
