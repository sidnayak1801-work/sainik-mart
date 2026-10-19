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

| Method | Path                      | Auth                | Body                                      |
| ------ | ------------------------- | ------------------- | ----------------------------------------- |
| `POST` | `/api/auth/register`      | No                  | `name`, `email`, `phone`, `password`      |
| `POST` | `/api/auth/login`         | No                  | `identifier` (email or phone), `password` |
| `POST` | `/api/auth/admin/login`   | No                  | `email`, `password` (ADMIN only)          |
| `GET`  | `/api/auth/me`            | Bearer access token | —                                         |

Register always creates a `CUSTOMER`. There is no public admin registration. `POST /api/auth/admin/login` issues a JWT only when the user is `ADMIN` with a password hash; customers, unknown emails, and bad passwords all return **401 Invalid credentials**. That route is limited to 10 attempts per IP per 15 minutes (**429**). Generic `/api/auth/login` remains for tests and password customers. Login and register return `{ success: true, data: { user, accessToken } }`. `GET /me` returns `{ success: true, data: { user } }`. `passwordHash` is never returned.

### First admin (one-time provision)

Set these on the **API host only** (never in admin `VITE_` variables): `ADMIN_EMAIL`, `ADMIN_PASSWORD` (8+ chars), `ADMIN_PHONE` (required; `users.phone` is unique), optional `ADMIN_NAME`.

```bash
cd backend
npm run admin:provision
```

If that email already exists, the script **exits 0 and does not change password or role**. Safe to run on deploy. It is not hooked to `prisma db seed`.

If the email exists as `CUSTOMER` and you need an admin, promote in SQL and set `password_hash` yourself — the provisioner will not overwrite a live password.

Authenticated requests send `Authorization: Bearer <accessToken>`. Middleware verifies the JWT, then loads the user from PostgreSQL so `CUSTOMER` / `ADMIN` comes from the live `users.role` (not a stale token). Missing/invalid tokens return **401**. Wrong role returns **403 Forbidden**.

Public catalog GETs return **active** records only. Send an admin Bearer token to list or fetch inactive categories/products.

## Catalog

Customer and unauthenticated clients can **read** active catalog data. Only `ADMIN` can create, update, or deactivate.

### Categories

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/categories` | Public (active only; admin token sees inactive too) |
| `GET` | `/api/categories/:id` | Public (404 if inactive unless admin) |
| `POST` | `/api/categories` | ADMIN `{ name, imageUrl?, isActive? }` |
| `PATCH` | `/api/categories/:id` | ADMIN partial of the same fields |
| `DELETE` | `/api/categories/:id` | ADMIN — sets `isActive: false` (does not hard-delete) |

Duplicate `name` returns **409**. Missing id returns **404**.

### Products

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/products` | Public (active only; admin token sees inactive too) |
| `GET` | `/api/products/:id` | Public (404 if inactive unless admin) |
| `POST` | `/api/products` | ADMIN |
| `PATCH` | `/api/products/:id` | ADMIN |
| `DELETE` | `/api/products/:id` | ADMIN — sets `isActive: false` |

`GET /api/products` query parameters:

| Param | Default | Notes |
| --- | --- | --- |
| `page` | `1` | integer ≥ 1 |
| `limit` | `20` | integer 1–50 |
| `search` | — | case-insensitive match on `name` or `description` |
| `categoryId` | — | UUID; only products in that category |

Examples:

```text
GET /api/products
GET /api/products?page=1&limit=20
GET /api/products?search=milk
GET /api/products?categoryId=<uuid>
GET /api/products?search=milk&categoryId=<uuid>&page=1&limit=10
```

List response:

```json
{
  "success": true,
  "data": [{ "id": "...", "name": "Fresh Bananas", "price": 60, "discountPrice": 50 }],
  "pagination": { "page": 1, "limit": 20, "total": 125, "totalPages": 7 }
}
```

Create product body: `{ name, description, price, discountPrice?, stockQuantity?, categoryId, imageUrl?, isActive? }`. `price` and `discountPrice` must be ≥ 0; `discountPrice` cannot exceed `price`; `categoryId` must exist.

## Cart

All cart routes require a Bearer token. The JWT user owns the cart — `userId` is never taken from the body, query, or params. CUSTOMER and ADMIN both use their own cart.

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| `GET` | `/api/cart` | Authenticated | — |
| `POST` | `/api/cart/items` | Authenticated | `{ productId, quantity }` |
| `PATCH` | `/api/cart/items/:id` | Authenticated | `{ quantity }` |
| `DELETE` | `/api/cart/items/:id` | Authenticated | — |

A cart is created lazily on first `GET` or add. An empty cart is `{ id, items: [], subtotal: 0 }`.

`POST` **adds** quantity to an existing line for the same product (no duplicate `CartItem`s). `PATCH` **sets** the quantity. Quantity must be an integer ≥ 1. Inactive products, inactive categories, and requested quantity above `stockQuantity` are rejected with **400**. Missing products/items return **404**. Another user's cart item is **404** (not leaked).

Prices and `subtotal` are calculated on the server from the product `discountPrice` (or `price`). The client cannot send price or subtotal. Adding to the cart does not reduce stock.

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "items": [
      {
        "id": "...",
        "quantity": 2,
        "lineTotal": 160,
        "product": { "id": "...", "name": "Milk", "price": 100, "discountPrice": 80, "imageUrl": null, "stockQuantity": 20 }
      }
    ],
    "subtotal": 160
  }
}
```

## Authorization matrix

| Access | Routes |
| --- | --- |
| Public (no token) | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin/login`, `GET /health`, `GET /api/health`, `GET /api/categories`, `GET /api/categories/:id`, `GET /api/products`, `GET /api/products/:id` |
| Authenticated (`CUSTOMER` or `ADMIN`) | `GET /api/auth/me`; cart (`GET /api/cart`, `POST /api/cart/items`, `PATCH\|DELETE /api/cart/items/:id`); addresses (`GET\|POST /api/addresses`, `PATCH\|DELETE /api/addresses/:id`); customer orders (`POST\|GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel`) |
| `ADMIN` only | `POST\|PATCH\|DELETE /api/categories`, `POST\|PATCH\|DELETE /api/products`, `PATCH /api/admin/orders/:id/status` |

Address and order **business logic** is not implemented yet (those handlers return 501 after authorization).

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
| `npm test`                      | Auth, catalog, and cart API checks (`node:test`) |
| `npm run prisma:generate`       | Generate Prisma Client                       |
| `npm run prisma:migrate`        | Create and apply migrations (`migrate dev`)  |
| `npm run prisma:migrate:deploy` | Apply existing migrations (`migrate deploy`) |
| `npm run admin:provision`       | Create the first ADMIN if missing (never resets an existing password) |

## Notes

- Address and order **business logic** is not implemented yet (routes return 501).
- Never commit `.env` or real secrets.
