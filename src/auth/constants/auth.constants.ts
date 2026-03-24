// src/auth/constants/auth.constants.ts
// Este archivo define constantes clave para la autenticacion y autorizacion, como claves de metadata para roles y rutas publicas
// Estas constantes se usan en guards y decoradores para controlar el acceso a rutas protegidas y definir roles de usuario.
// ROLES_KEY se utiliza para almacenar los roles requeridos en los handlers de NestJS, mientras que IS_PUBLIC_KEY marca rutas que no requieren autenticacion.
// Al centralizar estas claves en un solo archivo, se mejora la mantenibilidad y se evita la duplicacion de strings literales en el codigo.
// Ejemplo de uso:
// @Roles(Role.ADMIN) -> usa ROLES_KEY para guardar metadata de roles
// @Public() -> usa IS_PUBLIC_KEY para marcar la ruta como publica y saltar autenticacion JWT.
// Importante: estas constantes deben ser unicas y descriptivas para evitar colisiones y mejorar la claridad del codigo.
// Nota: aunque estas constantes son simples strings, su uso consistente es crucial para el correcto funcionamiento de los guards y decoradores en la aplicacion.
// Ejemplo de uso en un guard:
// const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [...]);
// const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [...]);
// Al definir estas claves como constantes, se reduce el riesgo de errores tipograficos y se facilita la refactorizacion futura si se decide cambiar la implementacion de roles o rutas publicas.
// Importante: estas constantes deben ser exportadas para ser utilizadas en otros archivos del modulo de autenticacion, como guards y decoradores.
// En resumen, este archivo es un punto central para definir las claves de metadata utilizadas en la gestion de autenticacion y autorizacion en la aplicacion NestJS, mejorando la organizacion y mantenibilidad del codigo.
/**
 * ARCHIVO: auth.constants.ts
 * OBJETIVO: Centralizar las claves de metadata utilizadas en el sistema de autorizacion y autenticacion.
 * CONTENIDO: Define constantes que se usan en guards y decoradores para controlar acceso a rutas.
 * VALORES:
 *   - ROLES_KEY = 'roles': Clave de metadata para almacenar roles requeridos en un endpoint.
 *   - IS_PUBLIC_KEY = 'isPublic': Clave de metadata para marcar rutas que no requieren JWT.
 * CASO DE USO:
 *   - Guards (jwt-auth.guard.ts, roles.guard.ts) leen estas claves usando Reflector.
 *   - Decoradores (@Roles(), @Public()) las escriben al handler del controller.
 * VENTAJA: Centralizar strings evita errores de tipografia y facilita mantenimiento.
 */
export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
