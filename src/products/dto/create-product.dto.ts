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

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe tener máximo 2 decimales' })
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