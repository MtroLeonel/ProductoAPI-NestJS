/**
 * ARCHIVO: public.decorator.ts
 * OBJETIVO: Proporcionar un decorador para marcar rutas que no requieren autenticacion JWT.
 * CONTENIDO: Define el decorador @Public() usando NestJS SetMetadata.
 * CASO DE USO: Coloca @Public() sobre controladores o handlers para permitir acceso sin token.
 *   Ejemplo: @Public() @Post('register') register(@Body() dto) { ... }
 * VALOR AGREGADO: El JwtAuthGuard verifica IS_PUBLIC_KEY y salta validacion JWT si esta presente.
 */
import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/auth.constants';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
