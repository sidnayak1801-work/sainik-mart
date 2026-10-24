# Play Store readiness

This is a **checklist**, not an upload. Do not submit until the preview APK smoke in `TEST_PLAN.md` passes against production.

Official references (retrieved this audit):

- Target API: new apps must target API **36** as of 31 Aug 2026 — [Target API level](https://developer.android.com/google/play/requirements/target-sdk).
- Account deletion: prominent in-app path **and** a web URL — [User Data](https://support.google.com/googleplay/android-developer/answer/10144311).
- Privacy policy URL required for apps that process personal data.

## Package identity

| Field | Repo value (`my-app/app.json`) |
|-------|--------------------------------|
| applicationId | `in.sainikmart.app` |
| version | `1.0.0` |
| versionCode | `1` |
| name / slug | Sainik Mart / `sainik-mart` |
| EAS project | `bcb3837d-294b-4c0c-a56f-ae3537a83a41` |
| Production artifact | AAB (`eas.json` production `buildType: app-bundle`) |

Play Console application id must match `in.sainikmart.app`. Domain `sainikmartapp.in` is **not** the package name.

## Store URLs (live this audit)

Paste into Play Console:

- Privacy: `https://api.sainikmartapp.in/api/privacy`
- Account deletion (web): `https://api.sainikmartapp.in/api/account-deletion`

In-app: Profile → Delete account (`DELETE /api/auth/account`) plus Info → Privacy. **Unknown:** production `users.deleted_at` column until migrate is confirmed on Lightsail.

Contact on deletion page: `hello@sainikmart.in` — confirm that inbox is monitored.

## Data safety / permissions

Declared in `app.json`: `INTERNET`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`. Location and `AD_ID` are **blocked**. Razorpay WebView and MSG91 may add transitive permissions — re-check the merged manifest on the AAB before the Data safety form.

Collects (describe honestly on the form): phone number, name/email if entered, delivery address, order history, payment **tokens/ids** (not PAN — Razorpay hosted), optional FCM token. Account deletion anonymizes customer PII in code.

## Target SDK

Expo 57 / RN 0.86 typically maps to a current Android target. **Confirm** `targetSdkVersion` on the AAB (Android Studio APK Analyzer or `bundletool`) before submitting. If Play requires 36 and the AAB is lower, bump via Expo/`expo-build-properties` in a later change — **not done in this audit**.

## Signing

EAS manages the upload key unless you supplied your own. **Download and store** the EAS credentials backup (`npx eas credentials -p android`) so a lost laptop cannot brick updates. Do not commit keystores.

## Build for Play (operator, not this audit)

```bash
cd /Users/sellcoai/Testing/sainik-mart/my-app
npx eas env:list --environment production
# EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN + GOOGLE_SERVICES_JSON file env
npx eas build --platform android --profile production
```

Internal testing track first. Production AAB `9ed6261e-...` was started in a prior session — do not assume it is the current store binary; rebuild after confirming env.

## Console listing (still to create)

- Feature graphic, icon (1024), phone screenshots (not in repo).
- Short/full description (drafts exist in older sprint docs; rewrite to match shipped widget login, not password login).
- Content rating questionnaire.
- News / Crypto / Health declarations as applicable (grocery: typically none).
- Countries / pricing.
- Contact email/phone matching the legal pages.

## Policy mismatches to fix before review (code already known)

- Terms HTML still says pending orders can be cancelled; API returns **501**. Either implement cancel or change copy (out of scope for this docs-only audit).
- Do not claim location-based delivery; location permission is blocked.

## Not required for listing, but expected in review

Working OTP, checkout on **test** or clearly disclosed payments, deletion path, privacy URL 200, no broken WebView. Health endpoint alone is not enough.
