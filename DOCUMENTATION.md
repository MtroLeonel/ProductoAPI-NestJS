# Documentación Técnica — cesun-backend-project

## Descripción General

API REST desarrollada con **NestJS** para la gestión de productos. Implementa operaciones CRUD completas sobre una base de datos **PostgreSQL**, usando **Prisma ORM** como capa de acceso a datos. Incluye soft delete, restauración de registros y búsqueda con filtros dinámicos.

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

---

## Endpoints de la API

Base URL: `http://localhost:3000`

### Productos — `/products`

| Método | Ruta | Descripción | Código de éxito |
|---|---|---|---|
| `POST` | `/products` | Crear un nuevo producto | `201 Created` |
| `GET` | `/products` | Listar productos (con filtros opcionales) | `200 OK` |
| `GET` | `/products/count` | Contar productos activos | `200 OK` |
| `GET` | `/products/:id` | Obtener un producto por UUID | `200 OK` |
| `PATCH` | `/products/:id` | Actualizar parcialmente un producto | `200 OK` |
| `DELETE` | `/products/:id` | Eliminar permanentemente un producto | `204 No Content` |
| `PATCH` | `/products/:id/soft-delete` | Desactivar producto (`isActive: false`) | `200 OK` |
| `PATCH` | `/products/:id/restore` | Restaurar producto (`isActive: true`) | `200 OK` |

### Filtros disponibles en `GET /products`

| Query param | Tipo | Descripción |
|---|---|---|
| `isActive` | `boolean` | Filtrar por estado activo/inactivo |
| `search` | `string` | Búsqueda insensible a mayúsculas en `name` y `description` |

**Ejemplo:** `GET /products?isActive=true&search=laptop`

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
PORT=3000
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

La API estará disponible en: `http://localhost:3000`

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

---

## Ejemplos de uso con curl

**Crear un producto:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Dell", "description": "Laptop 15 pulgadas", "price": 1299.99, "stock": 10}'
```

**Listar productos activos con búsqueda:**
```bash
curl "http://localhost:3000/products?isActive=true&search=laptop"
```

**Obtener un producto por ID:**
```bash
curl http://localhost:3000/products/{uuid}
```

**Actualizar un producto:**
```bash
curl -X PATCH http://localhost:3000/products/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"price": 1199.99}'
```

**Soft delete:**
```bash
curl -X PATCH http://localhost:3000/products/{uuid}/soft-delete
```

**Restaurar producto:**
```bash
curl -X PATCH http://localhost:3000/products/{uuid}/restore
```

**Eliminar permanentemente:**
```bash
curl -X DELETE http://localhost:3000/products/{uuid}
```
