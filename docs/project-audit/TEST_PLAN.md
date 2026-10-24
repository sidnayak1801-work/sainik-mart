# Test plan

Automated tests prove API/admin contracts against **local** Postgres. They do not prove the EAS APK, MSG91, Razorpay live, or production inventory.

## Automated (run on this Mac)

### Backend

```bash
cd /Users/sellcoai/Testing/sainik-mart/backend
npm install
npx prisma generate
# Use local DB, not production:
DATABASE_URL='postgresql://sellcoai@localhost:5432/sainik_mart?schema=public' npm test
npm run build
```

Nine files, 84 tests when the local role can connect. Serial `tsx --test`. Covers: health, auth (widget mock + admin login + delete account), catalog, cart, address, order (including **501 cancel**), admin orders, payments verify (mocked Razorpay), upload (mocked Cloudinary).

Do **not** point `DATABASE_URL` at production for tests.

### Admin

```bash
cd /Users/sellcoai/Testing/sainik-mart/admin
npm install
npm test
npm run build
```

Vitest + Testing Library. Fetch is mocked. Does not hit production.

### Mobile

None. No Jest/Detox in `my-app/`.

## Manual — EAS APK vs production API

Follow `ANDROID_LOCAL_TESTING_GUIDE.md` (uninstall old package, preview APK).

| # | Flow | Pass | Cost / risk |
|---|------|------|-------------|
| 1 | Cold start, no crash | Home tabs | None |
| 2 | Catalog matches admin.sainikmartapp.in | Names, prices, images | None |
| 3 | Guest cart add/qty | Totals | None |
| 4 | MSG91 OTP login | JWT session | **Real SMS / MSG91 credits** |
| 5 | Address CRUD | Saved on server | None |
| 6 | Checkout | Order + payment | **Razorpay test vs live** — live charges money and uses production stock |
| 7 | Order history | Matches admin orders | None |
| 8 | Admin status change | App order updates; FCM if configured | None |
| 9 | Privacy / terms in-app | Matches `/api/privacy` | None |
| 10 | Delete account | Throwaway phone only | **Destroys that customer row** (anonymize) |

Skip 6 on **live** Razorpay until you accept a real charge. Skip 10 on any real customer.

## What each layer cannot catch

| Layer | Misses |
|-------|--------|
| Backend tests | MSG91 network, Razorpay dashboard, Cloudinary, FCM delivery, nginx, TLS, production `deleted_at` column |
| Admin tests | Real CORS, baked `VITE_API_URL`, Cloudinary |
| APK smoke | iOS, Play review, target SDK, Data safety form |
| Health HTTP | Auth, payments, migrations |

## Production inventory

Admin CRUD writes the same DB the APK reads **if** both use `https://api.sainikmartapp.in`. Inactive products/categories are hidden from the public catalog. Tests that create SKUs on **local** Postgres never appear in the APK.

## Suggested order

1. `DATABASE_URL=... npm test` + `npm run build` in `backend/`.
2. `npm test` in `admin/`.
3. Preview APK smoke 1–5, 9.
4. Checkout on **test** Razorpay keys only.
5. Throwaway delete-account.
6. Then Play listing (`PLAY_STORE_READINESS.md`).
