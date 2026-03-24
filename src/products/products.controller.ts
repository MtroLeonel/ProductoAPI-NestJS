/**
 * ARCHIVO: products.controller.ts
 * OBJETIVO: Exponer endpoints REST para gestion de productos con autorizacion por roles.
 * ENDPOINTS:
 *   - POST /products (@Roles(Manager, Admin)): Crear producto.
 *   - GET /products (@Roles(User, Manager, Admin)): Listar con filtros (isActive, search).
 *   - GET /products/count (@Roles(User, Manager, Admin)): Contar productos activos.
 *   - GET /products/:id (@Roles(User, Manager, Admin)): Obtener producto por UUID.
 *   - PATCH /products/:id (@Roles(Admin)): Actualizar producto.
 *   - DELETE /products/:id (@Roles(Admin)): Eliminar permanentemente.
 *   - PATCH /products/:id/soft-delete (@Roles(Admin)): Desactivar (soft delete).
 *   - PATCH /products/:id/restore (@Roles(Admin)): Reactivar producto.
 * GUARDS GLOBALES: @UseGuards(JwtAuthGuard, RolesGuard) requiere JWT en todas las rutas.
 * VALIDACIONES: ParseUUIDPipe valida formato UUID en parametros (ej: :id).
 * MATRIZ DE PERMISOS:
 *   - USER: Solo lectura.
 *   - MANAGER: Lectura + creacion.
 *   - ADMIN: Todo (crear, leer, actualizar, eliminar).
 * DEPENDENCIAS: ProductsService para logica de negocio.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('products')
// Todas las rutas de productos requieren JWT y evaluacion de roles.
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Solo MANAGER y ADMIN pueden crear productos.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.MANAGER, Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Lectura habilitada para cualquier rol autenticado.
  @Get()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN)
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  // Conteo util para dashboards, solo considera activos en el servicio.
  @Get('count')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN)
  count() {
    return this.productsService.count();
  }

  @Get(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  // Mutaciones criticas restringidas a ADMIN.
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // Soft delete mantiene trazabilidad sin borrar fisicamente.
  @Patch(':id/soft-delete')
  @Roles(Role.ADMIN)
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDelete(id);
  }

  // Restaura disponibilidad logica del producto.
  @Patch(':id/restore')
  @Roles(Role.ADMIN)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.restore(id);
  }
}
