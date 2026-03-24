/**
 * ARCHIVO: jwt.strategy.ts
 * OBJETIVO: Estrategia Passport que valida JWT y extrae payload para asignarle al request.
 * FLUJO:
 *   1. Passport intercepta peticion con header Authorization: Bearer <token>.
 *   2. Extrae el token (sin Bearer) y lo pasa a validate().
 *   3. JwtService verifica firma usando JWT_SECRET del .env.
 *   4. Si valido, devuelve payload {sub, email, role}.
 *   5. Este payload se asigna a request.user para que controller acceda.
 * CONFIGURACION:
 *   - secretOrKey: Lee JWT_SECRET del .env, mismo que usa signAccessToken en auth.service.
 *   - jwtFromRequest: Extrae token del header "Authorization" en formato "Bearer <token>".
 * PAYLOAD ESTRUCTURA: {sub: userId, email, role} se valida contra la interfaz JwtPayload.
 * VALIDACION: Si token expirado o firma invalida, Passport lanza automaticamente 401 Unauthorized.
 * DEPENDENCIAS: passport-jwt (@nestjs/passport), JwtService.
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Espera tokens en el header Authorization: Bearer <token>.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Firma/validacion con secreto centralizado en variables de entorno.
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  validate(payload: JwtPayload) {
    // Este objeto queda disponible como request.user en rutas protegidas.
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
