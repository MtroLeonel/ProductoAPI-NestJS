/**
 * ARCHIVO: auth.module.ts
 * OBJETIVO: Modulo encapsulador de autenticacion JWT y autorizacion por roles.
 * CONTENIDO:
 *   - AuthController: Endpoints /auth/register, /auth/login, /auth/me, /auth/users/:id/role.
 *   - AuthService: Logica de validacion, hashing, emision de JWT.
 *   - JwtModule: Configura JWT con secreto y ttl (expiracion).
 *   - PassportModule: Integra Passport con estrategia 'jwt'.
 *   - JwtStrategy: Valida tokens en cada peticion.
 * IMPORTS:
 *   - ConfigModule: Accede a JWT_SECRET y JWT_EXPIRES_IN del .env.
 *   - UsersModule: Para crear/buscar usuarios en register/login.
 *   - PassportModule: Proporciona autenticacion JWT.
 *   - JwtModule: Firma y verifica tokens.
 * GUARDIAS GLOBALES: JwtAuthGuard y RolesGuard se aplican en ProductsController (no aqui).
 * FLUJO MODULO: Cliente -> AuthController -> AuthService -> UsersService -> PrismaService -> BD.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Reutiliza UsersService para registro/login y cambios de rol.
    UsersModule,
    // Define JWT como estrategia por defecto para guards de Passport.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Configura firma y expiracion del token desde variables de entorno.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-secret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
            '1d',
          ) as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // Guards y estrategia se exponen para otros modulos (ej. products).
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
