import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no es valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La password debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol invalido' })
  role?: Role;
}
