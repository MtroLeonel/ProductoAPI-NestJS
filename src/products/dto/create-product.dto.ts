/**
 * ARCHIVO: create-product.dto.ts
 * OBJETIVO: Validar y tipificar el body del endpoint POST /products.
 * CONTENIDO: DTO que define estructura esperada al crear un nuevo producto.
 * CAMPOS Y VALIDACIONES:
 *   - name (requerido): String max 255 chars, validado no vacio.
 *   - description (opcional): String libre.
 *   - price (requerido): Numero positivo con maximo 2 decimales (ej: 99.99).
 *   - stock (opcional): Numero >= 0, default 0 en BD.
 *   - isActive (opcional): Boolean, default true en BD.
 * TRANSFORMACIONES (@Type()): Convierte strings a numeros/booleans automaticamente.
 * CASO DE USO: MANAGER/ADMIN envian POST /products con datos -> ValidationPipe valida usando CreateProductDto.
 * FLUJO: Body JSON -> Validacion reglas -> Transformacion tipos -> Service recibe tipado.
 * VALOR AGREGADO: Reglas de negocio (precio positivo, stock no negativo) aseguradas en DTO.
 */
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe tener máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
