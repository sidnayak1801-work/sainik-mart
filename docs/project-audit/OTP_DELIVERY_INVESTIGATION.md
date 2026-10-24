# OTP delivery investigation

Audit date: 21 Oct 2026. Evidence is repository source plus operator-observed MSG91 widget UI/logs this week. No production SSH, no `.env` contents, no secrets, no customer numbers.

Legend: **Confirmed** (code or observed UI/logs) · **Assumed (ops)** · **Unknown** (needs dashboard, DLR, or Lightsail).

---

## A. Executive summary

**Status:** strongly suspected, not “SMS delivery fixed.”

**Single most likely cause:** Production login SMS is sent by the **MSG91 DefaultWidget on the phone**, not by the Lightsail API. MSG91 **accepted** those sends (widget “We’ve sent a 6-digit code…” and OTP-widget log rows). The handset did not receive the text. That gap is **provider / DLT / wallet / carrier delivery**, outside this repo.

**Strongest evidence:**

1. [`LoginScreen.tsx`](../../my-app/src/screens/auth/LoginScreen.tsx) never calls `sendOtp`. It only opens `DefaultWidget` with `widgetId` + `tokenAuth`. Number entry and SMS dispatch are inside `@msg91comm/sendotp-react-native`.
2. [`my-app/src/api/auth.ts`](../../my-app/src/api/auth.ts) `sendOtp` / `resendOtp` / `verifyOtp` are unused by any screen.
3. Backend `MSG91_AUTH_KEY` is used only in [`verifyMsg91AccessToken`](../../backend/src/services/otp/msg91.widget.ts) **after** the customer types the OTP (`POST /api/auth/verify-widget`). Updating that key cannot make Path A SMS arrive.
4. Operator: widget verify screen + MSG91 OTP-widget logs with SMS channel, OTP not verified, **access token unverified** — expected if no code was entered.

**Confidence:** high that the **app/API are not the SMS sender** for this login. Medium that the remaining failure is MSG91 SMS DLR (not inspected here). **Unknown:** Lightsail `OTP_PROVIDER` / Authkey actually loaded in PM2; SMS delivery-report status for those request IDs.

`GET https://api.sainikmartapp.in/api/health` 200 does not prove SMS.

---

## B. End-to-end flow

### Path A — production customer login (used)

```text
LoginScreen.onContinue
  → DefaultWidget (MSG91 SDK)
      → MSG91 panel config + SMS send (not our API)
      → handset (carrier)
  → onCompletion({ success, message: accessToken })
      → AuthContext.loginWithWidgetToken
      → POST {API_URL}/api/auth/verify-widget
      → auth.controller.verifyWidgetToken
      → auth.service.verifyWidget
      → verifyMsg91AccessToken (MSG91_AUTH_KEY)
      → authenticateVerifiedCustomer (JWT)
```

| Step | File | Function / lines |
|------|------|------------------|
| Continue; require widget id + token | `my-app/src/screens/auth/LoginScreen.tsx` | `onContinue` 32–39; `DefaultWidget` 70–83; `INDIA` `+91` 17–22 |
| SDK wrapper | `my-app/src/vendor/msg91DefaultWidget.ts` | `require("@msg91comm/sendotp-react-native")` |
| Token / id from env | `my-app/src/utils/constants.ts` | `MSG91_WIDGET_*` 48–49; `resolveApiUrl` 28–44 (`!__DEV__` → baked URL only) |
| EAS bake | `my-app/eas.json` | preview/production `EXPO_PUBLIC_API_URL=https://api.sainikmartapp.in`, widget **ID** only |
| After OTP typed | `my-app/src/context/AuthContext.tsx` | `loginWithWidgetToken` 67–71 |
| Client POST | `my-app/src/api/auth.ts` | `verifyWidget` 24–28 |
| Fetch | `my-app/src/api/client.ts` | `request` 77–119; public path includes `/api/auth/verify-widget` 65–74; no custom timeout |
| Route | `backend/src/routes/auth.routes.ts` | `POST /verify-widget` 37 |
| Controller | `backend/src/controllers/auth.controller.ts` | `verifyWidgetToken` 46–48 |
| Service | `backend/src/services/auth.service.ts` | `verifyWidget` 253–256 |
| MSG91 verify | `backend/src/services/otp/msg91.widget.ts` | `POST https://control.msg91.com/api/v5/widget/verifyAccessToken` 6, 35–75; body `authkey` + `access-token` |
| Phone from MSG91 | `backend/src/utils/phone.ts` | `normalizeIndianMobile` 10–37 → E.164 `+91…` |

Frontend errors for this path: widget `result.message`, or `toAuthErrorMessage` (`AuthContext.tsx` 116–125) after verify-widget fails. **Send failures never go through the API client.**

### Path B — legacy API send (not used by Login UI)

```text
POST /api/auth/send-otp { phoneNumber }
  → otpIpLimit → sendOtpSchema → sendOtpCode → issueOtp
  → normalizeIndianMobile → AuthOtp row (HMAC hash)
  → getOtpProvider().sendOtp
  → Msg91OtpProvider POST /api/v5/otp
```

| Step | File | Lines |
|------|------|-------|
| Client helper (unused by UI) | `my-app/src/api/auth.ts` | `sendOtp` 5–9 |
| Route | `backend/src/routes/auth.routes.ts` | 34–36 |
| `issueOtp` | `backend/src/services/auth.service.ts` | 129–185; hourly cap + cooldown; `"OTP sent successfully"` only after provider returns |
| Provider pick | `backend/src/services/otp/index.ts` | `getOtpProvider` 16–28 |
| MSG91 send | `backend/src/services/otp/msg91.provider.ts` | 7–51 |
| Mobile for MSG91 | `toMsg91Mobile` | `phone.ts` 46: strip leading `+` → `91XXXXXXXXXX` |

Verify Path B: `POST /api/auth/verify-otp` → `verifyOtp` (`auth.service.ts` 191–251) against `AuthOtp`. Widget login does **not** write or read those rows.

Admin `POST /api/auth/admin/login` is email/password and is unchanged by this flow.

---

## C. Findings table

| Area | Finding | Evidence | Impact | Confidence |
|------|---------|----------|--------|------------|
| Login UI | SMS send is widget-only; no backend send | `LoginScreen.tsx` 32–83; no `sendOtp(` in screens | Updating API Authkey cannot deliver Path A SMS | Confirmed |
| Dead client helpers | `sendOtp` / `resendOtp` / `verifyOtp` unused by UI | `auth.ts` vs LoginScreen imports | Path B never runs from the app | Confirmed |
| APK API URL | Release builds bake production HTTPS | `eas.json`; `constants.ts` 33–34 | Not localhost on EAS APK | Confirmed |
| `__DEV__` / Expo | Loopback rewritten to Metro host | `constants.ts` 36–41 | Metro/Expo Go can hit laptop API; OTP widget still MSG91 | Confirmed |
| Widget token on EAS | ID in `eas.json`; token **not** in `eas.json` | `eas.json` 13–16, 23–26; `.easignore` omits `.env` | Missing EAS token → config-load error, not “sent” UI | Confirmed in repo; token presence on the installed APK **Unknown** (widget did open in session) |
| Authkey role | Verify access token only | `msg91.widget.ts` 40–56 | Local `backend/.env` edit ≠ production SMS | Confirmed |
| Path B HTTP | `response.ok` only; JSON `type` ignored | `msg91.provider.ts` 46–51 | If Path B were used, MSG91 200 + error body could look like success | Confirmed defect on unused path |
| Path B config | Needs Authkey **and** `MSG91_TEMPLATE_ID` + `MSG91_SENDER_ID` | `msg91.provider.ts` 15–19 | Authkey alone is not enough for Path B | Confirmed |
| Env load | `dotenv` then Zod at import | `env.ts` 6–7, 53–71 | Process must restart after `.env` change. PM2 load **Unknown** (no SSH) | Confirmed in code |
| Rate limit | 60 hits/hour/IP on **API** OTP routes | `otpIpLimit.ts` 5–31 | Does not apply to widget SMS send | Confirmed |
| Widget “sent” | SDK + OTP-widget logs | Operator UI/logs this week | API **acceptance**, not handset delivery | Confirmed observation |
| Access token unverified | MSG91 column until `verifyAccessToken` succeeds | `msg91.widget.ts` 35–75; MSG91 docs | Expected if OTP never typed; not a send bug | Confirmed |
| OTP_PROVIDER=mock | Forbidden when `NODE_ENV=production` | `env.ts` 37–42 | Process would fail boot if mock in prod | Confirmed |
| CORS / validation | Widget send is not our HTTP | — | Not a send-failure cause | Confirmed |
| Health 200 | API process up | prior public fetch | Does not imply SMS | Confirmed |
| DLT / wallet / SMS DLR | Not in git | — | Most likely remaining cause | **External — required** |
| PM2 uses latest dist + env | Not SSH-verified | — | Irrelevant to Path A send | Unknown |

---

## D. Required MSG91 configuration

Names only. Do not print values.

| Name | Required? | Consumed by | Purpose |
|------|-----------|-------------|---------|
| `EXPO_PUBLIC_MSG91_WIDGET_ID` | Path A | `constants.ts` → LoginScreen | Widget id (`eas.json` also hardcodes the same id) |
| `EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN` | Path A | same | Widget **tokenAuth**, not Authkey. Must be in the **native build** |
| `MSG91_AUTH_KEY` | Path A verify; Path B send | `msg91.widget.ts`; `msg91.provider.ts`; `env.ts` if `OTP_PROVIDER=msg91` | Server Authkey: verify access token; also Path B `authkey` header |
| `OTP_PROVIDER` | Production boot | `env.ts`, `otp/index.ts` | Must be `msg91` in production (not `mock`) |
| `MSG91_TEMPLATE_ID` | Path B only | `msg91.provider.ts` 12, 32 | OTP v5 `template_id` |
| `MSG91_SENDER_ID` | Path B only | `msg91.provider.ts` 13, 33 | OTP v5 `sender` |
| `OTP_LENGTH`, `OTP_EXPIRY_MINUTES`, `OTP_RESEND_COOLDOWN_SECONDS`, `OTP_MAX_ATTEMPTS`, `OTP_MAX_REQUESTS_PER_HOUR`, `OTP_HMAC_SECRET` | Path B store/verify | `issueOtp` / `verifyOtp` | Not used for widget SMS |

**Presence without values (Mac):**

```bash
cd /Users/sellcoai/Testing/sainik-mart/my-app
# names only
npx eas env:list --environment preview
npx eas env:list --environment production
test -n "$(grep -E '^EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN=.' .env 2>/dev/null)" && echo "local widget token: set" || echo "local widget token: missing"
```

Do **not** `cat` `.env`.

**Lightsail (names only):** see section E.

Official widget docs: [MSG91 OTP widget](https://msg91.com/help/sendotp/how-to-integrate-the-new-login-with-otp-widget), [npm `@msg91comm/sendotp-react-native`](https://www.npmjs.com/package/@msg91comm/sendotp-react-native). Path B matches MSG91 OTP v5 (`control.msg91.com/api/v5/otp` + `authkey` header) — **not** the Flow API. Confirmed in code; payload correctness vs current MSG91 account templates is **Unknown**.

---

## E. Production diagnostic commands

Read-only. Do not restart PM2, do not `printenv`, do not `cat` `.env`.

### macOS (this machine)

```bash
# EAS env names (values masked by EAS)
cd /Users/sellcoai/Testing/sainik-mart/my-app
npx eas env:list --environment preview
npx eas whoami

# Confirm release URL bake (no secrets)
grep -n EXPO_PUBLIC_API_URL eas.json
```

Do not dump Metro logs that may contain tokens.

### Lightsail (SSH as deploy user)

```bash
pm2 show sainik-mart-api
# cwd, script, restarts, status — confirm entry is compiled dist, not an old tree

# Env *names* only (no values)
pm2 prettylist | python3 -c "
import sys,re
text=sys.stdin.read()
for name in ['OTP_PROVIDER','MSG91_AUTH_KEY','MSG91_TEMPLATE_ID','MSG91_SENDER_ID','NODE_ENV']:
    print(name, 'present' if re.search(r\"'\"+name+r\"'\", text) or re.search(name+r'=', text) else 'absent')
"

# Or, from the app cwd shown by pm2:
grep -E '^(OTP_PROVIDER|MSG91_AUTH_KEY|MSG91_TEMPLATE_ID|MSG91_SENDER_ID)=' .env | cut -d= -f1

# Logs: provider errors only (phones already masked in code as +91******xxxx)
pm2 logs sainik-mart-api --lines 200 --nostream | grep -E 'MSG91|OTP provider|Authkey|widget token' || true
```

Nginx: Path A send does not hit `/api/auth/send-otp`. For verify-widget after a real OTP:

```bash
# names of locations only
sudo nginx -T 2>/dev/null | grep -E 'server_name|location /api' || true
```

Deployed source vs git: compare `git rev-parse HEAD` on the server to `origin/main`. A stale `dist/` does **not** explain missing SMS on Path A.

---

## F. Root cause and fix

### 1. Wrong lever: `MSG91_AUTH_KEY` for missing SMS (confirmed)

- **Cause:** Path A send never uses Authkey. Verify-widget does.
- **Files:** `LoginScreen.tsx`; `msg91.widget.ts` `verifyMsg91AccessToken`.
- **Change now:** none in git. Put Authkey on **Lightsail** (and restart later, not in this audit) so login works **after** SMS arrives. Do not put Authkey in the app.
- **Why:** Authkey cannot create widget SMS.
- **Verify:** MSG91 SMS **delivery** report for the widget request id, then one test OTP on a handset, then successful login (access token becomes verified).
- **Rollback:** N/A (no code change).

### 2. Acceptance ≠ delivery (strongly suspected)

- **Cause:** Widget and OTP-widget logs record MSG91 **accept**. Handset empty ⇒ DLT template mapping, SMS wallet, sender/PEID, or carrier DLR fail.
- **File:** none in repo (MSG91 dashboard).
- **Change:** dashboard only — SMS DLR for the same request id; approved transactional OTP template bound to widget Sainikmart; SMS credits.
- **Verify:** new log row + SMS DLR `Delivered` + SMS on a test SIM.
- **Rollback:** revert widget template/channel in MSG91.

### 3. Path B treats HTTP 200 as send success (confirmed, unused)

- **Cause:** `Msg91OtpProvider` ignores MSG91 JSON `type`.
- **File:** `backend/src/services/otp/msg91.provider.ts` `sendOtp` 46–51.
- **Smallest later fix (not this task):** require `type === "success"` and log status (still `maskPhone`). Does **not** fix Path A.
- **Rollback:** revert that parse.

### 4. Do not switch login to Path B in this investigation

That would change the product (own OTP store + `MSG91_TEMPLATE_ID` / sender on Lightsail). Out of scope. Customer auth stays OTP-only; admin password login stays.

---

## G. Verification checklist

- [x] Frontend Path A does not POST `/api/auth/send-otp` (`LoginScreen.tsx`).
- [x] EAS APK API URL is production HTTPS (`eas.json`).
- [ ] Widget token present on the **installed** APK (EAS preview env; do not print it).
- [ ] MSG91 OTP-widget log: new row on Continue → send (operator).
- [ ] **SMS** delivery/DLR for that request id: `Delivered` or a reject reason.
- [ ] Test handset receives SMS (one number; do not log the number here).
- [ ] Correct OTP: widget success → `verify-widget` → session; MSG91 access-token **verified**.
- [ ] Wrong OTP: widget/API `INVALID_OTP`; no JWT.
- [ ] Expired / retry: MSG91 widget timers (Path A) or Path B cooldown if that API is ever used.
- [x] Backend logs use `maskPhone` (`phone.ts` 39–44; `issueOtp` / widget errors).
- [ ] After SMS works: Lightsail `MSG91_AUTH_KEY` present (name only) and Authkey IP allowlist = server public IP.

Automated tests already mock MSG91 (`backend/src/auth.test.ts`: send-otp validation, cooldown, provider 502, widget success/failure). Do not send real SMS in CI. No `my-app` widget tests.

---

## H. External checks still required

| Check | Who |
|-------|-----|
| SMS DLR / delivery status for the widget request id | MSG91 SMS reports (not only OTP-widget Logs) |
| DLT template + sender + PEID on widget Sainikmart | MSG91 + DLT portal |
| SMS wallet / transactional route | MSG91 billing |
| Widget token **Enabled**; Mobile Integration; Captcha off for mobile | MSG91 widget settings |
| Authkey IP whitelist = Lightsail public IP | MSG91 (needed **after** OTP, not for send) |
| PM2 env names / cwd / `dist` vs git | Lightsail, section E |
| Real-device receipt | One test handset |

Do not claim delivery is fixed until the handset checklist item is ticked.

---

## Top three findings and first action

1. **Login SMS is the MSG91 widget, not Lightsail.** `MSG91_AUTH_KEY` (local or production) does not send that SMS.
2. **MSG91 accepted the send** (widget copy + OTP-widget logs). **Access token unverified** only means verify-widget has not run.
3. **Remaining failure is SMS DLR / DLT / credits / carrier** — not a missing route in this repo.

**Do this first:** In MSG91, open **SMS delivery / DLR** (not only OTP-widget Logs) for the latest Sainikmart request id. Use that status (`Delivered` vs DLT/credits/reject). Then one 10-digit test on a handset. Do not rebuild the app or rotate Authkey for “no SMS.”
