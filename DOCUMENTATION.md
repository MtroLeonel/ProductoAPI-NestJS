# Documentación Técnica — cesun-backend-project

## Alcance de este documento

- Este archivo (`DOCUMENTATION.md`) es la referencia tecnica completa del proyecto.
- Para instalacion rapida, ejecucion basica y uso inicial, consulta [`README.md`](./README.md).

## Descripción General

API REST desarrollada con **NestJS** para la gestión de productos. Implementa operaciones CRUD completas sobre una base de datos **PostgreSQL**, usando **Prisma ORM** como capa de acceso a datos. Incluye soft delete, restauración de registros, búsqueda con filtros dinámicos y autenticación con JWT basada en roles.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| NestJS | ^11.0.1 | Framework principal |
| TypeScript | ^5.7.3 | Lenguaje de programación |
| Prisma ORM | ^7.4.2 | Acceso a base de datos |
| @prisma/adapter-pg | ^7.4.2 | Adaptador PostgreSQL nativo |
| pg | ^8.20.0 | Driver PostgreSQL |
| class-validator | ^0.15.1 | Validación de DTOs |
| class-transformer | ^0.5.1 | Transformación de tipos |
| @nestjs/config | ^4.0.3 | Variables de entorno |
| @nestjs/jwt | ^11.x | Emision y validacion de JWT |
| @nestjs/passport | ^11.x | Integracion de estrategias de autenticacion |
| passport-jwt | ^4.x | Estrategia JWT para request guard |
| bcrypt | ^6.x | Hash y validacion de passwords |
| Docker / Docker Compose | — | Infraestructura de base de datos |

---

## Estructura del Proyecto

```
cesun-backend-project/
├── prisma/
│   ├── schema.prisma          # Esquema del modelo de datos
│   └── migrations/            # Historial de migraciones SQL
├── src/
│   ├── main.ts                # Bootstrap de la aplicación
│   ├── app.module.ts          # Módulo raíz
│   ├── prisma/
│   │   ├── prisma.module.ts   # Módulo global de Prisma
│   │   └── prisma.service.ts  # Servicio de conexión con Pool pg
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── strategies/jwt.strategy.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── dto/create-user.dto.ts
│   └── products/
│       ├── products.module.ts
│       ├── products.controller.ts  # Endpoints REST
│       ├── products.service.ts     # Lógica de negocio
│       └── dto/
│           ├── create-product.dto.ts
│           ├── update-product.dto.ts
│           └── query-product.dto.ts
├── docker-compose.yml         # Servicio PostgreSQL
├── Dockerfile                 # Imagen de la app
└── .env                       # Variables de entorno (no incluido en repo)
```

---

## Guia de lectura del codigo (lineas importantes)

Esta seccion resume los puntos mas importantes del codigo para entender la API sin recorrer todo el proyecto desde cero.

### 1) Arranque de la aplicacion

- `src/main.ts`
- `app.setGlobalPrefix('api/v1')`: define el prefijo comun de todos los endpoints.
- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`: asegura validacion estricta y conversion de tipos en DTOs.
- `app.enableCors()`: habilita llamadas desde frontend o clientes externos.

### 2) Composicion de modulos

- `src/app.module.ts`
- `ConfigModule.forRoot({ isGlobal: true })`: habilita variables de entorno en toda la app.
- `PrismaModule`, `UsersModule`, `AuthModule`, `ProductsModule`: separacion por dominio (datos, usuarios, autenticacion y productos).

### 3) Capa de acceso a datos

- `src/prisma/prisma.service.ts`
- `PrismaService extends PrismaClient`: centraliza el acceso a base de datos.
- Uso de `Pool` de `pg` + `PrismaPg`: manejo de conexiones mas controlado para entornos reales.
- `onModuleInit` y `onModuleDestroy`: apertura/cierre ordenado de conexion.

### 4) Flujo de autenticacion

- `src/auth/auth.controller.ts`
- `POST /auth/register` y `POST /auth/login` son publicos con `@Public()`.
- `GET /auth/me` requiere JWT y devuelve el usuario autenticado desde `request.user`.
- `PATCH /auth/users/:id/role` requiere rol `ADMIN`.

- `src/auth/auth.service.ts`
- `validateUser()`: valida existencia, estado activo y password con `bcrypt.compare`.
- `signAccessToken()`: firma JWT con `sub`, `email`, `role`.
- `register()` y `login()`: devuelven siempre `{ user, access_token }` para estandarizar respuesta.

- `src/auth/strategies/jwt.strategy.ts`
- Extrae token desde `Authorization: Bearer <token>`.
- `validate(payload)` transforma payload a objeto de usuario que luego consumen los guards.

### 5) Autorizacion por roles

- `src/auth/decorators/roles.decorator.ts`
- `@Roles(...)`: agrega metadata de roles requeridos por endpoint.

- `src/auth/guards/jwt-auth.guard.ts`
- Extiende `AuthGuard('jwt')` y respeta `@Public()` leyendo metadata `IS_PUBLIC_KEY`.

- `src/auth/guards/roles.guard.ts`
- Lee los roles requeridos con `Reflector`.
- Si no hay roles definidos, permite acceso.
- Si hay roles, compara `request.user.role` contra la lista requerida.

### 6) Reglas de negocio de productos

- `src/products/products.controller.ts`
- Guard global del controlador: `@UseGuards(JwtAuthGuard, RolesGuard)`.
- Roles por endpoint:
  - Lectura (`GET`): `USER`, `MANAGER`, `ADMIN`.
  - Creacion (`POST`): `MANAGER`, `ADMIN`.
  - Mutaciones criticas (`PATCH/DELETE`): `ADMIN`.

- `src/products/products.service.ts`
- `findAll(query)`: construye filtro dinamico por `isActive` y `search`.
- `softDelete()` y `restore()`: reutilizan `update()` para evitar duplicar logica.
- Manejo de errores Prisma:
  - `P2002`: conflicto de unico (ej. nombre repetido).
  - `P2025`: recurso no encontrado en operaciones de escritura.

### 7) Reglas de negocio de usuarios

- `src/users/users.service.ts`
- `create()`: hashea password con bcrypt antes de persistir.
- `toSafeUser()`: elimina password de respuestas para no exponer datos sensibles.
- `updateRole()`: actualiza rol y devuelve usuario seguro.

### 8) Contratos de entrada (DTOs)

- `src/auth/dto/register.dto.ts` y `src/auth/dto/login.dto.ts`
- Validan formato de email y longitud minima de password.

- `src/products/dto/create-product.dto.ts`
- Valida nombre, precio positivo, maximo de decimales y conversion de tipos con `@Type(() => Number/Boolean)`.

### 9) Modelo y permisos en base de datos

- `prisma/schema.prisma`
- `enum Role { ADMIN MANAGER USER }`: base del control de permisos.
- `User`: email unico, password hasheado, rol e indicador `isActive`.
- `Product`: nombre unico, `price Decimal(10,2)`, `isActive` para soft delete.

### 10) Punto de entrada para mantenimiento futuro

Si necesitas cambiar comportamiento de negocio, este orden ayuda a ubicar rapido donde tocar:

1. Endpoint y permisos: `controller` + `@Roles`.
2. Logica de negocio: `service`.
3. Validaciones de entrada: `dto`.
4. Persistencia: `prisma.service.ts` + `schema.prisma`.
5. Seguridad transversal: `jwt.strategy.ts`, `jwt-auth.guard.ts`, `roles.guard.ts`.

---

## Modelo de Datos

### Tabla `products`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `String` (UUID) | Identificador único, generado automáticamente |
| `name` | `VARCHAR(255)` | Nombre único del producto |
| `description` | `TEXT` (opcional) | Descripción del producto |
| `price` | `DECIMAL(10,2)` | Precio con hasta 2 decimales |
| `stock` | `INT` | Cantidad en inventario (default: 0) |
| `isActive` | `BOOLEAN` | Estado del producto (default: true) |
| `createdAt` | `TIMESTAMP` | Fecha de creación automática |
| `updatedAt` | `TIMESTAMP` | Fecha de modificación automática |

### Tabla `users`

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `String` (UUID) | Identificador unico generado automaticamente |
| `email` | `VARCHAR(255)` | Email unico del usuario |
| `password` | `VARCHAR(255)` | Password hasheada con bcrypt |
| `role` | `Role` | Nivel de permiso: `ADMIN`, `MANAGER`, `USER` |
| `isActive` | `BOOLEAN` | Estado del usuario (default: true) |
| `createdAt` | `TIMESTAMP` | Fecha de creacion automatica |
| `updatedAt` | `TIMESTAMP` | Fecha de modificacion automatica |

---

## Endpoints de la API

Base URL: `http://localhost:3000/api/v1`

### Productos — `/products`

| Método | Ruta | Descripción | Código de éxito |
|---|---|---|---|
| `POST` | `/api/v1/products` | Crear un nuevo producto | `201 Created` |
| `GET` | `/api/v1/products` | Listar productos (con filtros opcionales) | `200 OK` |
| `GET` | `/api/v1/products/count` | Contar productos activos | `200 OK` |
| `GET` | `/api/v1/products/:id` | Obtener un producto por UUID | `200 OK` |
| `PATCH` | `/api/v1/products/:id` | Actualizar parcialmente un producto | `200 OK` |
| `DELETE` | `/api/v1/products/:id` | Eliminar permanentemente un producto | `204 No Content` |
| `PATCH` | `/api/v1/products/:id/soft-delete` | Desactivar producto (`isActive: false`) | `200 OK` |
| `PATCH` | `/api/v1/products/:id/restore` | Restaurar producto (`isActive: true`) | `200 OK` |

### Autenticacion — `/auth`

| Metodo | Ruta | Descripcion | Codigo de exito |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Registrar usuario y devolver token JWT | `201 Created` |
| `POST` | `/api/v1/auth/login` | Iniciar sesion y devolver token JWT | `201 Created` |
| `GET` | `/api/v1/auth/me` | Obtener payload del usuario autenticado | `200 OK` |
| `PATCH` | `/api/v1/auth/users/:id/role` | Cambiar rol de un usuario (solo ADMIN) | `200 OK` |

### Matriz de permisos por rol

| Endpoint | USER | MANAGER | ADMIN |
|---|---|---|---|
| `GET /products` | Si | Si | Si |
| `GET /products/count` | Si | Si | Si |
| `GET /products/:id` | Si | Si | Si |
| `POST /products` | No | Si | Si |
| `PATCH /products/:id` | No | No | Si |
| `DELETE /products/:id` | No | No | Si |
| `PATCH /products/:id/soft-delete` | No | No | Si |
| `PATCH /products/:id/restore` | No | No | Si |
| `PATCH /api/v1/auth/users/:id/role` | No | No | Si |

### Filtros disponibles en `GET /products`

| Query param | Tipo | Descripción |
|---|---|---|
| `isActive` | `boolean` | Filtrar por estado activo/inactivo |
| `search` | `string` | Búsqueda insensible a mayúsculas en `name` y `description` |

**Ejemplo:** `GET /api/v1/products?isActive=true&search=laptop`

---

## Cómo se construyó

### 1. Conexión a la base de datos con Prisma + Pool nativo

Se configuró `PrismaService` extendiendo `PrismaClient` con el adaptador `@prisma/adapter-pg`. Esto utiliza un `Pool` de conexiones de `pg` en lugar del cliente default de Prisma, lo que permite mejor gestión de conexiones en producción:

```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
super({ adapter });
```

`PrismaModule` se registra como módulo global para estar disponible en toda la aplicación sin necesidad de importarlo en cada módulo.

### 2. Validación global con ValidationPipe

En `main.ts` se configuró un `ValidationPipe` global con tres opciones:

- **`whitelist: true`** — elimina propiedades no declaradas en el DTO del body de la request.
- **`forbidNonWhitelisted: true`** — lanza un error `400` si se envían propiedades no permitidas.
- **`transform: true`** — convierte automáticamente los tipos del body (ej. string `"3.5"` → number `3.5`).

### 3. DTOs y validación de entrada

Cada operación tiene su propio DTO validado con decoradores de `class-validator`:

- `CreateProductDto` — valida campos requeridos (`name`, `price`) y opcionales (`description`, `stock`, `isActive`).
- `UpdateProductDto` — extiende `CreateProductDto` haciendo todos los campos opcionales (usando `PartialType` de `@nestjs/mapped-types`).
- `QueryProductDto` — valida los parámetros de query `isActive` y `search`.

### 4. Soft Delete

El campo `isActive` permite desactivar productos sin eliminarlos físicamente de la base de datos. Los endpoints `/soft-delete` y `/restore` simplemente actualizan ese campo usando internamente el mismo método `update`.

### 5. Manejo de errores

El servicio maneja errores de Prisma de forma explícita:

- Código `P2002` (duplicado único) → `400 BadRequestException` con mensaje descriptivo.
- Código `P2025` (registro no encontrado en update/delete) → `404 NotFoundException`.
- Cualquier otro error → `500 InternalServerErrorException`.

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://cesun_user:cesun_password@localhost:5432/backend3_db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
ADMIN_SEED_EMAIL="admin@demo.com"
ADMIN_SEED_PASSWORD="Admin12345!"
PORT=3000
```

En requests protegidas, enviar siempre:

```http
Authorization: Bearer <access_token>
```

---

## Cómo ejecutar el proyecto

### Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker](https://www.docker.com/) y Docker Compose
- [npm](https://www.npmjs.com/)

---

### Paso 1 — Levantar la base de datos con Docker

```bash
docker-compose up -d
```

Esto crea un contenedor PostgreSQL con:
- **Host:** `localhost:5432`
- **Usuario:** `cesun_user`
- **Contraseña:** `cesun_password`
- **Base de datos:** `backend3_db`

---

### Paso 2 — Instalar dependencias

```bash
npm install
```

---

### Paso 3 — Crear el archivo `.env`

```env
DATABASE_URL="postgresql://cesun_user:cesun_password@localhost:5432/backend3_db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
ADMIN_SEED_EMAIL="admin@demo.com"
ADMIN_SEED_PASSWORD="Admin12345!"
PORT=3000
```

---

### Paso 4 — Ejecutar migraciones de Prisma

```bash
npx prisma migrate deploy
```

Esto aplica la migración `20260307231515_iniciarbd` que crea la tabla `products`.

---

### Paso 5 — Generar el cliente de Prisma

```bash
npx prisma generate
```

---

### Paso 6 — Iniciar el servidor

**Modo desarrollo (con hot reload):**
```bash
npm run start:dev
```

**Modo producción:**
```bash
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000/api/v1`

---

### Paso 7 — Seed de usuario administrador

```bash
npm run seed
```

Este comando crea o actualiza un usuario admin con el email y password definidos en `ADMIN_SEED_EMAIL` y `ADMIN_SEED_PASSWORD`.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Inicia en modo desarrollo con hot reload |
| `npm run build` | Compila TypeScript a JavaScript en `/dist` |
| `npm run start:prod` | Ejecuta el build compilado |
| `npm run test` | Ejecuta pruebas unitarias |
| `npm run test:e2e` | Ejecuta pruebas end-to-end |
| `npm run test:cov` | Genera reporte de cobertura de tests |
| `npm run lint` | Ejecuta ESLint con autocorrección |
| `npm run format` | Formatea el código con Prettier |
| `npm run seed` | Crea o actualiza un usuario administrador inicial |

---

## Ejemplos de uso con curl

**Crear un producto:**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Dell", "description": "Laptop 15 pulgadas", "price": 1299.99, "stock": 10}'
```

**Listar productos activos con búsqueda:**
```bash
curl "http://localhost:3000/api/v1/products?isActive=true&search=laptop"
```

**Obtener un producto por ID:**
```bash
curl http://localhost:3000/api/v1/products/{uuid}
```

**Actualizar un producto:**
```bash
curl -X PATCH http://localhost:3000/api/v1/products/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"price": 1199.99}'
```

**Soft delete:**
```bash
curl -X PATCH http://localhost:3000/api/v1/products/{uuid}/soft-delete
```

**Restaurar producto:**
```bash
curl -X PATCH http://localhost:3000/api/v1/products/{uuid}/restore
```

**Eliminar permanentemente:**
```bash
curl -X DELETE http://localhost:3000/api/v1/products/{uuid}
```

**Registrar usuario ADMIN:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@demo.com", "password": "12345678", "role": "ADMIN"}'
```

**Login y obtencion de JWT:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@demo.com", "password": "12345678"}'
```

**Cambiar rol de usuario (solo ADMIN):**
```bash
curl -X PATCH http://localhost:3000/api/v1/auth/users/{user-uuid}/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token-admin}" \
  -d '{"role": "MANAGER"}'
```
