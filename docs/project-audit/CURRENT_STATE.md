# Sainik Mart — current state

Audit date: 20 Oct 2026. Evidence is repository source, public HTTP, and git. Secrets are named, never quoted.

Legend:

- **Verified in code** — present in this tree.
- **Verified by test** — covered by `backend` or `admin` automated tests.
- **Verified in production** — public HTTP this session.
- **Assumed (ops)** — deployment context from the operator, not SSH-verified.
- **Unknown** — cannot confirm without credentials or device access.

## Git

| Item | Evidence |
|------|----------|
| Branch | `main` |
| HEAD | `abaccd8` — *Generate Prisma client before tsc so deletedAt types exist.* |
| Remote | `origin/main` at the same commit (working tree clean at audit time) |
| GitHub | `sidnayak1801-work/sainik-mart` (from `git remote`) |
| CI | No `.github/workflows` |

Source matching `origin/main` does **not** prove Lightsail is running this commit. Production runtime is **Unknown** beyond public HTTP.

Recent commits (newest first): `abaccd8` Prisma generate before tsc; `43bc720` Play listing API / account deletion / admin login; `6273750` admin and API on prod; `878ca11` FCM; `5926b1a` Razorpay test-mode.

## Layout

| Directory | Role | Entry |
|-----------|------|--------|
| `my-app/` | Customer Expo app (only mobile app) | `expo/AppEntry.js` → `App.tsx` |
| `backend/` | Express + Prisma API | `src/server.ts` → `createApp()` |
| `admin/` | Vite admin SPA | `src/main.tsx` |
| `docs/` | Sprint plans + this audit | — |
| Root `package.json` | Convenience scripts (`start`, `api`, `admin`, `eas:*`) | — |

No second mobile app. Android package and iOS bundle id are both `in.sainikmart.app` (`my-app/app.json`). Domain `sainikmartapp.in` is for admin/API hosts, not the package name.

## Production hosts (leads vs verified)

| Host | Role | This session |
|------|------|----------------|
| `https://api.sainikmartapp.in/api/health` | API | **Verified in production:** HTTP 200 `{"success":true,"message":"API is running","env":"production"}` |
| `https://api.sainikmartapp.in/api/privacy` | Play privacy HTML | **Verified in production:** HTML privacy policy |
| `https://api.sainikmartapp.in/api/account-deletion` | Play deletion HTML | **Verified in production:** HTML deletion steps + `hello@sainikmart.in` |
| `https://admin.sainikmartapp.in` | Admin SPA | **Assumed (ops)** live; not re-fetched this audit |
| Lightsail Ubuntu, IP `13.210.210.105`, PM2, nginx, Let's Encrypt | Infra | **Assumed (ops)** — no SSH this audit |
| Postgres `sainikmart` / role `sainikmart_app` / user `sainikdeploy` | DB | **Assumed (ops)** |

## Backend (verified in code)

Stack: Node ≥20, Express 5, TypeScript, Prisma **6.16.2**, PostgreSQL. Build: `prisma generate && tsc` (`backend/package.json`).

Mounted routes (`backend/src/routes/index.ts`): `/health` (DB ping), `/api/health`, legal HTML at `/privacy` and `/api/privacy` (same for terms and account-deletion), `/api/auth/*`, catalog, cart, addresses, orders, notifications, payments, `/api/admin/orders`, `/api/admin/uploads`.

Auth:

- Customer: MSG91 DefaultWidget → `POST /api/auth/verify-widget`; legacy send/verify OTP still on API.
- Admin: `POST /api/auth/admin/login` (email + password, ADMIN role, IP rate limit).
- JWT `{ sub, role }` in `Authorization: Bearer`; live `users.role` and `deletedAt` checked in middleware.
- Account deletion: `DELETE /api/auth/account` anonymizes CUSTOMER (not ADMIN); sets `deletedAt`.

Schema: `User.deletedAt` mapped to `deleted_at`. Migration `backend/prisma/migrations/20261019120000_user_deleted_at/migration.sql`. **Unknown** whether that migration is applied on production Postgres. Generate does not add the column.

Production env rules (`backend/src/config/env.ts`): `OTP_PROVIDER=mock` is **rejected** when `NODE_ENV=production`. `OTP_PROVIDER=msg91` requires `MSG91_AUTH_KEY`. Quote and percent-encode `DATABASE_URL` or Prisma may parse hostname as `2026`.

Optional at boot (fail at use): Cloudinary, Razorpay, Firebase Admin. CORS: `CORS_ORIGIN` (admin should be `https://admin.sainikmartapp.in`).

Tests: nine files under `backend/src/*.test.ts`. **Verified by test** locally (84 pass) when `DATABASE_URL` points at local `sainik_mart`. Default production-shaped `.env` denied DB access in one run — do not use production DB for tests.

Gap: `POST /api/orders/:id/cancel` returns **501** (`notImplemented`). Terms HTML still describes pending cancellation.

## Admin (verified in code)

Vite 7 + React 19 + React Router 7. JWT in `localStorage` (`sainik-mart.admin.accessToken`). Production API fallback `https://api.sainikmartapp.in` (`admin/src/api/client.ts`). `VITE_*` is baked at **build** time.

Functional: login, products, categories, inventory stock PATCH, order list/detail/status, image upload via `POST /api/admin/uploads`. Dashboard is quick links only.

Tests: Vitest `app.test.tsx`, `catalog.test.tsx`, `orders.test.tsx` (mocked fetch).

## Mobile (verified in code)

Expo SDK ~57, React Native 0.86, React Navigation (not Expo Router). Guest browse + guest cart; login only for checkout, addresses, orders, profile mutations.

| Item | Value |
|------|--------|
| Package | `in.sainikmart.app` |
| Version / versionCode | `1.0.0` / `1` |
| Scheme | `sainikmart` (Razorpay return) |
| EAS project | `bcb3837d-294b-4c0c-a56f-ae3537a83a41`, owner `devsid18` |
| Preview | APK, `EXPO_PUBLIC_API_URL=https://api.sainikmartapp.in` |
| Production | AAB, same API URL |
| Widget ID | baked in `eas.json`; **tokenAuth not in eas.json** (EAS env / local `.env`) |

`__DEV__` rewrites loopback API URLs to the Metro host. Production native builds use **only** baked `EXPO_PUBLIC_API_URL`. Expo Go cannot run MSG91 native SDK or FCM; `push.ts` skips native push when `appOwnership === "expo"`.

No `my-app` automated tests.

## Environment variable names (no values)

**API host:** `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `CORS_ORIGIN`, `OTP_PROVIDER`, OTP tuning vars, `OTP_HMAC_SECRET`, `MSG91_AUTH_KEY`, optional `MSG91_TEMPLATE_ID` / `MSG91_SENDER_ID`, Razorpay pair, Cloudinary trio, Firebase trio, `ADMIN_*` for provisioner only.

**Admin build:** `VITE_API_URL`.

**Mobile:** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_MSG91_WIDGET_ID`, `EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN`. EAS file env `GOOGLE_SERVICES_JSON` (gitignored `google-services.json`).

## External services

| Service | Code | Blocks local APK? |
|---------|------|-------------------|
| PostgreSQL | Prisma | Tests need a DB; APK uses production API |
| MSG91 | Widget verify + optional send-OTP | Login needs widget token in the **native** build |
| Razorpay Checkout | Create order + `POST /api/payments/verify` | Use **test** keys for smoke; live keys charge money |
| Cloudinary | Admin upload proxy | Catalog still works with manual image URLs |
| Firebase Admin + FCM | Optional; missing creds disable push | Browse/login work without it |
| Expo EAS | `eas.json` | Required for installable APK/AAB |
| Google Play | Not submitted | Not required for APK sideload |

## What is working vs not

**Working in code + (where noted) production HTTP:** health, privacy/deletion pages, catalog APIs, admin login path, customer widget auth path, cart/orders/payments in code, account deletion in code.

**Implemented but not verified on a physical phone:** full guest browse against production catalog, MSG91 OTP on EAS APK, Razorpay, FCM, delete-account against production DB.

**Blocked / broken for “open the app now”:** Expo Go for OTP; `npm run eas:preview` from repo root (`eas: command not found` — binary is `eas`); Android “App not installed” when an older `in.sainikmart.app` uses a different signature.

**Incomplete:** customer cancel 501, no Play listing assets, no CI, dashboard metrics, unused `AuthNavigator` / README drift (password login vs widget).
