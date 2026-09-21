# Sainik Mart Admin

Browser dashboard for store operations. This app is UI only — it uses the existing Express API (`POST /api/auth/login`, `GET /api/auth/me`). Admin APIs stay in `backend/`.

## Setup

```bash
cp .env.example .env
npm install
```

Start the API from the repo root (`npm run api`), then:

```bash
npm run admin
```

from the repo root, or `npm run dev` in this folder. Open http://localhost:5173/admin/login.

Promote a user to admin in Postgres (do not commit credentials):

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```
