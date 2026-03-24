<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API REST con NestJS + Prisma + PostgreSQL para gestion de productos, autenticacion JWT y autorizacion por roles.

## Documentation scope

- Este archivo es la guia rapida de arranque.
- La documentacion tecnica completa esta en [DOCUMENTATION.md](./DOCUMENTATION.md).

## Quick start

### Requisitos

- Node.js 18+
- Docker + Docker Compose
- npm

### 1) Instalar dependencias

```bash
npm install
```

### 2) Levantar base de datos

```bash
docker-compose up -d
```

### 3) Configurar variables de entorno (.env)

Crea un archivo `.env` en la raiz del proyecto con:

```env
DATABASE_URL="postgresql://cesun_user:cesun_password@localhost:5432/backend3_db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
ADMIN_SEED_EMAIL="admin@demo.com"
ADMIN_SEED_PASSWORD="Admin12345!"
PORT=3000
```

### 4) Migraciones y cliente de Prisma

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5) Seed opcional de administrador

```bash
npm run seed
```

### 6) Ejecutar API

```bash
npm run start:dev
```

Base URL: `http://localhost:3000/api/v1`

## Scripts principales

```bash
npm run start:dev
npm run build
npm run start:prod
npm run test
npm run test:e2e
npm run seed
```

## Auth rapida

Header para rutas protegidas:

```http
Authorization: Bearer <access_token>
```

## Endpoints principales

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/products`
- `POST /api/v1/products`

Referencia completa de endpoints y permisos: [DOCUMENTATION.md](./DOCUMENTATION.md).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
