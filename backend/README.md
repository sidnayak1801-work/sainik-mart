# Sainik-mart Backend

Express + TypeScript + Prisma API foundation for the Sainik-mart grocery delivery MVP.

## Architecture

```text
Route → Controller → Service → Prisma/Database
```

Business logic lives in services. Routes only mount paths and middleware.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL database.
2. Install dependencies:

```bash
npm install
```

3. Generate the Prisma client:

```bash
npm run prisma:generate
```

4. Apply migrations (creates the `users` table):

```bash
npm run prisma:migrate
```

5. Start the API in development:

```bash
npm run dev
```

Health: `GET http://localhost:4000/api/health`  
DB ping: `GET http://localhost:4000/health`

## Auth

| Method | Path                 | Auth                | Body                                      |
| ------ | -------------------- | ------------------- | ----------------------------------------- |
| `POST` | `/api/auth/register` | No                  | `name`, `email`, `phone`, `password`      |
| `POST` | `/api/auth/login`    | No                  | `identifier` (email or phone), `password` |
| `GET`  | `/api/auth/me`       | Bearer access token | —                                         |

Register always creates a `CUSTOMER`. Login and register return `{ success: true, data: { user, accessToken } }`. `GET /me` returns `{ success: true, data: { user } }`. `passwordHash` is never returned.

Authenticated requests send `Authorization: Bearer <accessToken>`. Middleware verifies the JWT, then loads the user from PostgreSQL so `CUSTOMER` / `ADMIN` comes from the live `users.role` (not a stale token). Missing/invalid tokens return **401**. Wrong role returns **403 Forbidden**. Catalog, cart, address, and order **handlers still return 501** after authorization succeeds.

## Authorization matrix

| Access | Routes |
| --- | --- |
| Public (no token) | `POST /api/auth/register`, `POST /api/auth/login`, `GET /health`, `GET /api/health`, `GET /api/categories`, `GET /api/categories/:id`, `GET /api/products`, `GET /api/products/:id` |
| Authenticated (`CUSTOMER` or `ADMIN`) | `GET /api/auth/me`; cart (`GET /api/cart`, `POST /api/cart/items`, `PATCH\|DELETE /api/cart/items/:id`); addresses (`GET\|POST /api/addresses`, `PATCH\|DELETE /api/addresses/:id`); customer orders (`POST\|GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel`) |
| `ADMIN` only | `POST\|PATCH\|DELETE /api/categories`, `POST\|PATCH\|DELETE /api/products`, `PATCH /api/admin/orders/:id/status` |

## Day 6 route skeleton

Catalog, cart, address, and order **business logic** is not implemented yet. After a request is authorized, those handlers return `501`.

- `GET|POST|PATCH|DELETE /api/categories`
- `GET|POST|PATCH|DELETE /api/products`
- `GET /api/cart`, `POST /api/cart/items`, `PATCH|DELETE /api/cart/items/:id`
- `GET|POST /api/addresses`, `PATCH|DELETE /api/addresses/:id`
- `POST|GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel`
- `PATCH /api/admin/orders/:id/status` (ADMIN)

## Scripts

| Script                          | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `npm run dev`                   | Start with hot reload (`tsx watch`)          |
| `npm run build`                 | Compile TypeScript to `dist/`                |
| `npm start`                     | Run compiled server                          |
| `npm run lint`                  | Lint with ESLint                             |
| `npm run lint:fix`              | Lint and auto-fix                            |
| `npm run format`                | Format files with Prettier                   |
| `npm run format:check`          | Check formatting without writing             |
| `npm run prisma:generate`       | Generate Prisma Client                       |
| `npm run prisma:migrate`        | Create and apply migrations (`migrate dev`)  |
| `npm run prisma:migrate:deploy` | Apply existing migrations (`migrate deploy`) |

## Notes

- Catalog, cart, address, and order **business logic** is not implemented yet (routes return 501).
- Never commit `.env` or real secrets.
