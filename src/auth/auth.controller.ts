/**
 * ARCHIVO: auth.controller.ts
 * OBJETIVO: Exponer endpoints REST para autenticacion (registro, login, obtener perfil, cambio de rol).
 * ENDPOINTS:
 *   - POST /auth/register (@Public): Crea usuario, retorna {user, access_token}.
 *   - POST /auth/login (@Public): Login con credenciales, retorna {user, access_token}.
 *   - GET /auth/me (@UseGuards(JwtAuthGuard)): Retorna usuario autenticado desde request.user.
 *   - PATCH /auth/users/:id/role (@Roles(Role.ADMIN)): Cambia rol a otro usuario (solo admin).
 * DECORADORES CLAVE:
 *   - @Public(): Salta validacion JWT para registro/login.
 *   - @UseGuards(): Aplica validaciones de JWT y roles.
 *   - @Roles(): Restringe acceso segun rol del usuario.
 * FLUJO AUTENTICACION: Cliente envia credenciales -> Validacion -> AuthService.login() -> JWT -> {user, token}.
 * SEGURIDAD: Passwords nunca se devuelven en respuestas, solo user seguro sin password.
 * DEPENDENCIAS: AuthService (logica), UsersService (cambio de rol).
 */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Registro publico: crea usuario y devuelve JWT inicial.
  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Login publico: valida credenciales y entrega access token.
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Retorna el usuario autenticado inyectado por la estrategia JWT.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: Request) {
    return request.user;
  }

  // Solo ADMIN puede cambiar el rol de otros usuarios.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('users/:id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeUserRoleDto: ChangeUserRoleDto,
  ) {
    return this.usersService.updateRole(id, changeUserRoleDto.role);
  }
}
