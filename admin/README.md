# Sainik Mart Admin

Browser dashboard for store operations. This app is UI only — it uses `POST /api/auth/admin/login` and `GET /api/auth/me`. Admin APIs stay in `backend/`.

## Setup

```bash
cp .env.example .env
npm install
```

`.env` only needs `VITE_API_URL` (local: `http://localhost:4000`). Never put `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL`, or JWT secrets in `VITE_` variables.

Start the API from the repo root (`npm run api`), then:

```bash
npm run admin
```

from the repo root, or `npm run dev` in this folder. Open http://localhost:5173/admin/login.

Create the first admin on the API host with `npm run admin:provision` (see `backend/README.md`). Do not register admins from this UI.

## Production

Build with the live API URL:

```bash
VITE_API_URL=https://api.sainikmartapp.in npm run build
```

Upload `dist/` to `admin.sainikmartapp.in`. Nginx must serve `index.html` for SPA routes (`try_files $uri /index.html`). API `CORS_ORIGIN` must be `https://admin.sainikmartapp.in`.
