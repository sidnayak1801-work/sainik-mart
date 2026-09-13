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

Health check: `GET http://localhost:4000/health`

## Auth

| Method | Path                 | Auth                | Body                                      |
| ------ | -------------------- | ------------------- | ----------------------------------------- |
| `POST` | `/api/auth/register` | No                  | `name`, `email`, `phone`, `password`      |
| `POST` | `/api/auth/login`    | No                  | `identifier` (email or phone), `password` |
| `GET`  | `/api/auth/me`       | Bearer access token | —                                         |

Register always creates a `CUSTOMER`. Login and register return `{ success: true, data: { user, accessToken } }`. `GET /me` returns `{ success: true, data: { user } }`. `passwordHash` is never returned.

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

- Catalog, orders, and payments are not included yet.
- Never commit `.env` or real secrets.
