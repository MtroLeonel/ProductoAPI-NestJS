import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeUserRoleDto {
  @IsEnum(Role, { message: 'Rol invalido' })
  role: Role;
}
