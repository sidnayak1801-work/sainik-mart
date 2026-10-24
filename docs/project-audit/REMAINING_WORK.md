# Remaining work

Prioritized after the 20 Oct 2026 audit. This file is a backlog, not an implementation log. No code was changed for this audit.

## P0 — get a production APK on a phone

Until this lands, Play listing and “app not functioning” reports cannot be distinguished from install/signing issues.

1. `cd my-app && npm install` then `npx eas build --platform android --profile preview` (see `ANDROID_LOCAL_TESTING_GUIDE.md`).
2. Set EAS preview env `EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN` if missing.
3. Uninstall `in.sainikmart.app` on the device, then install the APK.
4. Smoke: launch, production catalog, guest cart (`TEST_PLAN.md` items 1–3).

**Owner:** operator on this Mac + phone. **Not done** this audit (prior APK hit “App not installed”).

## P1 — login and checkout on that APK

1. MSG91 widget login (real SMS). If fail: API `MSG91_AUTH_KEY`, `OTP_PROVIDER` (must not be `mock` in production), MSG91 IP whitelist vs Lightsail public IP.
2. Confirm Lightsail: quoted/encoded `DATABASE_URL`, `git pull` of `abaccd8`, `npm run build` (`prisma generate && tsc`), `npx prisma migrate deploy` (includes `deleted_at`), PM2 restart. **SSH not run this audit.**
3. Address + checkout on **Razorpay test keys**. Switch to live keys only after a paid test you accept.
4. Admin: create an active category + product on `admin.sainikmartapp.in`; confirm it appears after pull-to-refresh.

## P2 — Play Console listing

1. Production AAB with widget token + `GOOGLE_SERVICES_JSON`.
2. Privacy and deletion URLs (`PLAY_STORE_READINESS.md`).
3. Screenshots, Data safety, target SDK 36 confirmation, internal testing track.
4. Backup Android upload key.

Do not submit until P0–P1 smoke is green.

## P3 — product gaps (after a working APK)

| Item | Evidence | Suggested later work |
|------|----------|----------------------|
| Customer cancel 501 | `order.controller.ts` `notImplemented`; terms HTML overclaims | Implement PENDING cancel or change legal copy |
| Dashboard metrics | `DashboardPage.tsx` links only | Counts from existing admin APIs |
| CI | No `.github/workflows` | `npm test` + `npm run build` on PR |
| Mobile tests | none | Component tests; later Detox |
| Razorpay webhooks / refunds | `REFUNDED` unused | Webhook route + admin refund |
| README drift | Password login vs widget; `AuthNavigator` unused | Docs/dead code cleanup |
| In-memory rate limits | `loginIpLimit.ts`, OTP maps | Redis if multi-instance |
| iOS | No TestFlight | Separate Apple program |

## Explicitly not remaining “to hack around”

- Expo Go as a Play-quality client.
- `OTP_PROVIDER=mock` on production.
- Committing `.env` or `google-services.json`.
- Prisma reset / DROP / TRUNCATE.
- Root `npm run eas:preview` until the script is fixed to `npx eas` (optional P3).

## Done enough in repo (do not redo)

Play privacy/deletion HTML routes; in-app delete account; `User.deletedAt` + migration file; admin `POST /api/auth/admin/login`; EAS preview APK / production AAB URL bake; `backend` build `prisma generate && tsc`; public `/api/health` 200 on production this audit.
