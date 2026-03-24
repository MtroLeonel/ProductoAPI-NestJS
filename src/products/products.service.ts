/**
 * ARCHIVO: products.service.ts
 * OBJETIVO: Encapsular logica de negocio para productos (CRUD + soft delete).
 * RESPONSABILIDADES:
 *   - create(): Inserta producto nuevo, mapea errores Prisma P2002 (duplicado).
 *   - findAll(): Filtra dinamicamente por isActive y search (nombre/descripcion), ordena por fecha.
 *   - findOne(): Obtiene producto por ID, lanza 404 si no existe.
 *   - update(): Valida existencia, actualiza campos, maneja errores P2002 y P2025.
 *   - remove(): Elimina fisicamente un producto de la BD.
 *   - softDelete(): Desactiva producto (isActive: false), sin borrar fisicamente.
 *   - restore(): Reactiva producto (isActive: true).
 *   - count(): Retorna total de productos activos (usado en dashboards).
 * FLUJO SOFT DELETE: PATCH /products/:id/soft-delete -> update({isActive: false}) -> producto permanece en BD.
 * MAPEO DE ERRORES: P2002 (nombre duplicado) -> 400 BadRequest. P2025 (recurso no existe) -> 404 NotFound.
 * DEPENDENCIAS: PrismaService para acceso a BD.
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      // Traduce errores de Prisma a respuestas HTTP legibles para cliente.
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un producto con ese nombre');
        }
      }
      throw new InternalServerErrorException('Error al crear el producto');
    }
  }

  async findAll(query: QueryProductDto): Promise<Product[]> {
    const { isActive, search } = query;

    // Construye filtros dinamicos solo con parametros enviados por el cliente.
    const where: Prisma.ProductWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Valida existencia antes de actualizar para responder 404 consistente.
    await this.findOne(id); // Verificar que existe

    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un producto con ese nombre');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
      }
      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: string): Promise<Product> {
    // Valida existencia antes de eliminar para mantener semantica consistente.
    await this.findOne(id); // Verificar que existe

    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
      }
      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }

  async softDelete(id: string): Promise<Product> {
    // Reusa update para no duplicar reglas de validacion y errores.
    return await this.update(id, { isActive: false });
  }

  async restore(id: string): Promise<Product> {
    // Reactiva registro sin perder historial en DB.
    return await this.update(id, { isActive: true });
  }

  async count(): Promise<number> {
    // El conteo operacional considera solo productos activos.
    return await this.prisma.product.count({
      where: { isActive: true },
    });
  }
}
