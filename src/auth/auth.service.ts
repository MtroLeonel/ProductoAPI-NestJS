/**
 * ARCHIVO: auth.service.ts
 * OBJETIVO: Orquestar logica de autenticacion (registro, login) y emision de JWT.
 * RESPONSABILIDADES:
 *   - signAccessToken(): Firma JWT con payload (sub, email, role) y secreto del .env.
 *   - register(): Crea usuario nuevo, normaliza email, hashea password, emite token.
 *   - validateUser(): Valida existencia, estado activo y password contra hash bcrypt.
 *   - login(): Autentica usuario, devuelve usuario seguro + token.
 * FLUJO REGISTRO: POST /auth/register -> ValidationPipe -> createUser() -> hashPassword -> signToken -> {user, access_token}.
 * FLUJO LOGIN: POST /auth/login -> validateUser() -> bcrypt.compare() -> signToken -> {user, access_token}.
 * SEGURIDAD: Password nunca viaja en respuesta (toSafeUser). Email normalizado (lowercase). Mensajes genericos de error.
 * DEPENDENCIAS: UsersService (para crear/buscar usuarios), JwtService (para firmar tokens).
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService, SafeUser } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async signAccessToken(user: {
    id: string;
    email: string;
    role: Role;
  }) {
    // Payload minimo para identificar usuario y su nivel de acceso.
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  async register(registerDto: RegisterDto) {
    // Crea usuario y emite token en la misma respuesta para onboarding rapido.
    const user = await this.usersService.create(registerDto);
    const accessToken = await this.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      access_token: accessToken,
    };
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser> {
    const user = await this.usersService.findByEmail(email);

    // Bloquea login para usuarios inexistentes o desactivados.
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Compara contra hash almacenado, nunca contra texto plano.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Nunca retornamos password fuera de la capa de autenticacion.
    const { password: userPassword, ...safeUser } = user;
    void userPassword;
    return safeUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const accessToken = await this.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      access_token: accessToken,
    };
  }
}
