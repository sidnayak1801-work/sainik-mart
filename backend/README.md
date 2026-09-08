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

4. Start the API in development:

```bash
npm run dev
```

Health check: `GET http://localhost:4000/health`

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run migrations (after models are added) |

## Notes

- Domain features (auth, catalog, orders, payments) are not included in this foundation.
- Never commit `.env` or real secrets.
