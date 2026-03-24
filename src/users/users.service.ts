/**
 * ARCHIVO: users.service.ts
 * OBJETIVO: Gestionar operaciones de usuarios (creacion, busqueda, cambio de rol).
 * RESPONSABILIDADES:
 *   - toSafeUser(): Elimina password del usuario antes de devolver en respuestas.
 *   - create(): Hashea password con bcrypt (salt 10), normaliza email, mapea error P2002 (email duplicado).
 *   - findByEmail(): Busca usuario por email normalizado (lowercase).
 *   - findSafeById(): Busca usuario por ID, devuelve sin password, lanza 404 si no existe.
 *   - updateRole(): Actualiza rol de usuario, valida existencia previa, devuelve usuario seguro.
 * SEGURIDAD PASSWORD: Hash bcrypt con 10 salt rounds, nunca retorna password en respuestas.
 * NORMALIZACION EMAIL: Todos los emails se convierten a lowercase para evitar duplicados.
 * TIPO SafeUser: Utilidad TypeScript que omite 'password' del modelo User.
 * DEPENDENCIAS: PrismaService para acceso a BD, bcrypt para hashing.
 */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toSafeUser(user: User): SafeUser {
    // Sanitiza el modelo para nunca exponer password hacia afuera.
    const { password: userPassword, ...safeUser } = user;
    void userPassword;
    return safeUser;
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    // Hashea password antes de persistir; nunca se guarda en texto plano.
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          // Normaliza email para evitar duplicados por mayusculas/minusculas.
          email: createUserDto.email.toLowerCase(),
          password: hashedPassword,
          role: createUserDto.role,
        },
      });

      return this.toSafeUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }

      throw new InternalServerErrorException('No se pudo crear el usuario');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // Busca con email normalizado para consistencia de autenticacion.
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findSafeById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.toSafeUser(user);
  }

  async updateRole(id: string, role: Role): Promise<SafeUser> {
    // Verifica existencia para evitar actualizar ids inexistentes.
    await this.findSafeById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return this.toSafeUser(user);
  }
}
