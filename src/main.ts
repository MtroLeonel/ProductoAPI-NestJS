/**
 * ARCHIVO: main.ts
 * OBJETIVO: Punto de entrada de la aplicacion NestJS, bootstrap de la app.
 * CONTENIDO: Crea e configura la instancia de NestJS, aplica pipes globales, habilita CORS.
 * CONFIGURACIONES:
 *   - app.setGlobalPrefix('api/v1'): Todas las rutas bajo /api/v1.
 *   - app.useGlobalPipes(ValidationPipe): Valida DTOs, transforma tipos, whitelist propiedades.
 *   - app.enableCors(): Permite peticiones desde cualquier origen (origin).
 *   - app.listen(PORT): Inicia servidor en localhost:PORT (default 3000).
 * FLUJO: bootstrap() -> app.listen() -> API lista para recibir requests -> void para evitar floating promises.
 * PIPES: whitelist: true limpia propiedades inexistentes, forbidNonWhitelisted: true lanza 400 si hay extras.
 * TRANSFORMACION: Convierte strings a numeros/booleans en DTOs automaticamente.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Estandariza todas las rutas bajo /api/v1 (versionado basico de API).
  app.setGlobalPrefix('api/v1');
  // Valida y transforma payloads en todos los endpoints automaticamente.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma los tipos automáticamente
    }),
  );
  // Permite peticiones desde frontend u otros origenes configurables.
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
// Explicita que no se espera la promesa en el top-level.
void bootstrap();
