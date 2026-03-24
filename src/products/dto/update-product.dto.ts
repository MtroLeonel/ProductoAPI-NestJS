/**
 * ARCHIVO: update-product.dto.ts
 * OBJETIVO: Validar y tipificar el body del endpoint PATCH /products/:id.
 * CONTENIDO: DTO para actualizaciones parciales, extiende CreateProductDto.
 * CAMPOS: Mismo que CreateProductDto pero TODOS OPCIONALES (PartialType).
 *   - name (opcional), description, price, stock, isActive: solo incluidos si el cliente los envia.
 * VENTAJA: No requiere repetir reglas de validacion; reutiliza CreateProductDto.
 * CASO DE USO: ADMIN envia PATCH /products/{uuid} con {price: 1099.99} -> Solo precio se actualiza.
 * FLUJO: Body parcial -> Validacion solo campos incluidos -> Service filtra datos nulos -> update() en BD.
 * VALOR AGREGADO: Permite actualizaciones parciales sin forzar todo el objeto.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
