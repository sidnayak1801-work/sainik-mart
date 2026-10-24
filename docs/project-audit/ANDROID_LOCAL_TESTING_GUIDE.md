# Android local testing guide (this Mac)

Repo: `/Users/sellcoai/Testing/sainik-mart`. Package: `in.sainikmart.app`.

**Do not use Expo Go** for OTP, FCM, or a production-catalog check. The MSG91 DefaultWidget is a native module. Expo Go also points at `127.0.0.1:4000` unless you override `EXPO_PUBLIC_API_URL`.

Use an **EAS preview APK**. That profile bakes `EXPO_PUBLIC_API_URL=https://api.sainikmartapp.in` (`my-app/eas.json`).

## 0. One-time Mac setup

```bash
cd /Users/sellcoai/Testing/sainik-mart/my-app && npm install
```

Confirm EAS (binary name is `eas`, not `eas-cli`):

```bash
cd /Users/sellcoai/Testing/sainik-mart/my-app
npx eas --version
npx eas whoami
```

If unauthenticated: `npx eas login`. Project owner in `app.json` is `devsid18`.

Root `npm run eas:preview` is **broken** (`sh: eas: command not found`). Use the `npx eas` commands below.

Optional Android SDK (emulator / `adb`):

```bash
brew install --cask android-studio
# then Android Studio → SDK Manager → Android SDK + platform-tools
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
adb version
```

ADB is not required if you download the APK from expo.dev and install on the phone.

## 1. EAS secrets for a working login APK

Preview `eas.json` bakes widget **ID** only. Widget **tokenAuth** is `EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN` (not MSG91 Authkey).

```bash
cd /Users/sellcoai/Testing/sainik-mart/my-app
npx eas env:list --environment preview
```

If `EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN` is missing, add it as **sensitive** (plain env, not a secret — Expo inlines `EXPO_PUBLIC_*` at bundle time):

```bash
npx eas env:create --environment preview --name EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN --visibility sensitive --type string
```

Paste the widget token from MSG91 (same value as local `.env`; never commit it). Repeat for `--environment production` before an AAB.

`google-services.json` is gitignored. Push needs EAS file env `GOOGLE_SERVICES_JSON` (already used for production AAB). Browse/OTP/checkout do not require it.

## 2. Build preview APK

```bash
cd /Users/sellcoai/Testing/sainik-mart/my-app
npx eas build --platform android --profile preview
```

Wait until **finished**. Open the Expo dashboard link and download the `.apk`.

Do **not** use `--profile production` for sideload (that is an `.aab` for Play).

## 3. Uninstall the old package first

“App not installed” is almost always a **signature clash** with a previous `in.sainikmart.app` (Expo Go sibling, `expo run:android` debug, or an older EAS APK). Play Store is not required.

On the phone: Settings → Apps → Sainik Mart → Uninstall.

Or USB debugging:

```bash
adb uninstall in.sainikmart.app
```

Ignore `DELETE_FAILED_INTERNAL_ERROR` if the package was already gone.

## 4. Install the APK

Transfer the file (AirDrop, USB, Drive). On the phone: Files → open APK → Install. Allow “install unknown apps” for that source if Android asks.

USB:

```bash
adb install -r /path/to/sainik-mart-preview.apk
```

If `-r` still fails: uninstall, then `adb install` without `-r`.

Allow notifications if you will test FCM.

## 5. Smoke checklist (production API)

Confirm the APK is **not** Expo Go (no Expo project QR chrome). Then:

1. App opens without a red error overlay.
2. Home shows categories/products from **production** (same catalog as `https://admin.sainikmartapp.in`). If empty, admin SKUs may be inactive or you are still on a local API.
3. Open a product, add to cart as guest, change qty.
4. Login with MSG91 widget (real SMS; **costs MSG91 credits**).
5. Addresses: add one.
6. Checkout **only** if API Razorpay keys are **test** (`rzp_test_`). Live keys charge real money.
7. Profile → Privacy policy (in-app). Compare with `https://api.sainikmartapp.in/api/privacy`.
8. Account deletion: **throwaway** OTP account only. Then confirm login with that phone works again.

If login fails: widget token missing in this APK, API `MSG91_AUTH_KEY` unset, or MSG91 IP whitelist ≠ Lightsail public IP.

If catalog is empty but admin has products: category or product `isActive` false, or APK not using production URL.

## 6. Optional: USB debug log

```bash
adb logcat | grep -E 'ReactNativeJS|Expo|AndroidRuntime|sainik'
```

Do not paste secrets from logcat.

## 7. Local API instead of production (advanced)

Only if you **want** the phone to hit this Mac’s `backend` on port 4000:

1. `cd backend && npm run dev` with local Postgres.
2. `cd my-app && npx expo run:android` (native debug, **not** Expo Go).
3. Set `EXPO_PUBLIC_API_URL` in `my-app/.env` to `http://<Mac-LAN-IP>:4000` (not `127.0.0.1` on a physical phone).
4. Phone and Mac on the same Wi-Fi; Mac firewall allows 4000.

That APK/debug build is a **different signing key** from EAS preview. Uninstall before switching flavors.

`OTP_PROVIDER=mock` is for local/tests only. Production API **must not** use mock.

## 8. iPhone

No TestFlight/App Store setup in this repo. Native iOS needs Xcode + Apple Developer + MSG91 iOS widget config. Out of scope for this Android guide.

## Commands that will fail

| Command | Why |
|---------|-----|
| `npm run eas:preview` from repo root | Script calls `eas-cli`; binary is `eas` |
| `eas-cli build ...` | Wrong package name |
| `npx expo start` + Expo Go + OTP | Native module missing |
| Installing APK over an old `in.sainikmart.app` | Signature mismatch |
| `eas build --profile production` then sideload | Outputs AAB, not APK |
