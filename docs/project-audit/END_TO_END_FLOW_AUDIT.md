# End-to-end flow audit

Tags:

- **Code** — implemented in this repo.
- **Tested** — automated test exists (backend/admin unless noted).
- **Prod HTTP** — public URL returned expected body this audit.
- **Device** — not verified on a physical Android this audit.
- **Partial** — code exists but incomplete or stubbed.
- **Blocked** — configuration or runtime prevents the step.
- **Unknown** — needs production env or SSH.

Production admin catalog writes and the EAS APK share `https://api.sainikmartapp.in` **if** the APK was built with `eas.json` preview/production env. Expo Go / `__DEV__` uses the laptop API unless `EXPO_PUBLIC_API_URL` is production HTTPS.

---

## 1. App launch → connectivity → first screen

| Step | Status | Evidence |
|------|--------|----------|
| Splash / fonts | Code | `App.tsx`, expo-splash-screen |
| Restore JWT from SecureStore → `GET /api/auth/me` | Code | `AuthContext.tsx` |
| Invalid token → guest | Code | same |
| Main tabs without login | Code | `MainNavigator.tsx` always after splash |
| API reachable | Prod HTTP | `/api/health` 200 |
| Phone actually opens this UI | Device | APK install failed with “App not installed” |

**Depends on:** installable native build; baked or env API URL; API process up.

---

## 2. Phone number → OTP → session

| Step | Status | Evidence |
|------|--------|----------|
| Login screen MSG91 DefaultWidget | Code | `LoginScreen.tsx`, `msg91DefaultWidget.ts` |
| Widget token → `POST /api/auth/verify-widget` | Code + Tested | `auth.ts`, `auth.test.ts` (mock verifier) |
| JWT + user in SecureStore | Code | `AuthContext` |
| Expo Go | Blocked | Native MSG91 module; `.env.example` says use `expo run:*` |
| Production login | Unknown | Needs `MSG91_AUTH_KEY` on API, widget **tokenAuth** in EAS env, `OTP_PROVIDER=msg91` if send-OTP used |

Legacy `send-otp` / `verify-otp` exist on API and in `my-app/src/api/auth.ts` but **UI unused**. Widget path does not use `OTP_PROVIDER` for verify; send-OTP does.

**Depends on:** native APK/AAB, EAS `EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN`, API `MSG91_AUTH_KEY`, MSG91 dashboard (IP whitelist for Authkey = API public IP).

---

## 3. Browse categories and products

| Step | Status | Evidence |
|------|--------|----------|
| Home / categories / list / details | Code | Home, Categories, ProductList, ProductDetails |
| `GET /api/categories`, `/api/products` | Code + Tested | public active-only |
| Admin-created products on production | Code | same DB if admin uses production API |
| Visible in Expo Go against laptop | Partial | different database unless URL overridden |
| Visible in EAS APK | Device | not verified this audit |

Public list requires `isActive` product **and** active category (`product.service.ts`).

---

## 4. Cart quantities and totals

| Step | Status | Evidence |
|------|--------|----------|
| Guest cart in SecureStore | Code | `guestCart.ts` |
| Merge on login | Code | `cartService.ts` |
| Server cart after login | Code + Tested | `cart.test.ts` |
| Server-side prices/stock checks | Code + Tested | no decrement until order |

---

## 5. Delivery addresses

| Step | Status | Evidence |
|------|--------|----------|
| List/add/edit | Code | Address screens; auth required |
| CRUD API | Code + Tested | `address.test.ts`; delete 409 if used by order |
| GPS permission | Code | blocked in `app.json` (`blockedPermissions`) — typed addresses only |

---

## 6. Checkout → payment → order

| Step | Status | Evidence |
|------|--------|----------|
| Auth gate → Login | Code | `CheckoutScreen` |
| Create order from cart | Code + Tested | stock lock, snapshots, Razorpay order |
| Hosted checkout HTML | Code | `GET /api/payments/checkout` **not** in automated tests |
| Verify signature | Code + Tested | `POST /api/payments/verify` |
| Webhooks / refunds | Partial | `REFUNDED` enum unused |
| Live charges | Unknown | depends on Razorpay **test vs live** keys on API |

`deliveryFee` and `discount` are hardcoded `0` in `createOrder`.

**Destructive:** live Razorpay keys create real charges. Use test keys for smoke.

---

## 7. Order history and status

| Step | Status | Evidence |
|------|--------|----------|
| Customer list/detail | Code + Tested | `order.test.ts` |
| Admin status path | Code + Tested | PENDING→CONFIRMED→PACKING→OUT_FOR_DELIVERY→DELIVERED; CANCELLED from PENDING |
| Customer cancel | Partial | `POST /api/orders/:id/cancel` → **501** |

---

## 8. Admin sign-in → catalog → app visibility

| Step | Status | Evidence |
|------|--------|----------|
| `POST /api/auth/admin/login` | Code + Tested | `auth.test.ts`, `app.test.tsx` |
| Products/categories UI | Code + Tested (mocked) | `catalog.test.tsx` |
| Same production API as APK | Code | admin fallback + eas.json |
| Device sees new SKU | Device | pull-to-refresh; not verified |

---

## 9. Admin image upload → app images

| Step | Status | Evidence |
|------|--------|----------|
| `POST /api/admin/uploads` | Code + Tested (mock uploader) | `upload.test.ts` |
| Cloudinary | Unknown | 501 if env missing; manual image URL still works |
| `expo-image` in app | Code | Product cards/details |

---

## 10. Admin orders

| Step | Status | Evidence |
|------|--------|----------|
| List/search/status | Code + Tested | `adminOrder.test.ts`, `orders.test.tsx` |
| Payment status edit | Partial | display only in SPA |
| Dashboard KPIs | Partial | links only (`DashboardPage.tsx`) |

---

## 11. Push notifications

| Step | Status | Evidence |
|------|--------|----------|
| Register token after login | Code | `push.ts`; skipped in Expo Go |
| Order created / status FCM | Code + Tested (mock) | failures do not fail the order |
| `google-services.json` | Code | gitignored; EAS file env + `eas-google-services.js` |
| Real device delivery | Unknown / Device | needs Firebase Admin + Google services file |

---

## 12. Account deletion

| Step | Status | Evidence |
|------|--------|----------|
| Profile → Delete account | Code | `ProfileScreen.tsx` |
| `DELETE /api/auth/account` | Code + Tested | anonymize + `deletedAt`; admin 403 |
| JWT after delete | Code + Tested | 401 |
| Same phone can register again | Code + Tested | tombstone frees unique phone |
| Production column `deleted_at` | Unknown | migration must be applied on host |

**Destructive on production:** do not delete a real customer. Use a throwaway OTP account.

Orders and addresses used by orders are retained/anonymized (Restrict FKs) — **Code**.

---

## 13. Privacy policy and deletion instructions

| Step | Status | Evidence |
|------|--------|----------|
| In-app Privacy / Terms / About | Code | `legal.ts`, `InfoScreen.tsx` |
| `GET /api/privacy` | Prod HTTP | HTML 200 this audit |
| `GET /api/account-deletion` | Prod HTTP | HTML 200 this audit |
| Play Console fields | Unknown | not submitted |

---

## Dependency map (customer journeys)

```text
Installable native APK (EAS preview)
  → production API HTTPS
      → Postgres (schema including deleted_at if deletion used)
      → MSG91 (login)
      → Razorpay (checkout)
      → Cloudinary (images if not URL-only)
      → Firebase (push only)
  → EAS env: EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN
  → google-services.json (push only)

Admin SPA
  → same API + CORS_ORIGIN
  → Cloudinary for uploads
```

If any of: wrong API URL, Expo Go, unsigned/conflicting APK, mock OTP in production, missing widget token — the journey stops before catalog or login.
