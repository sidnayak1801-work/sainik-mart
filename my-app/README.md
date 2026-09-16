# Sainik Mart — Customer app

Cross-platform grocery delivery customer app for iOS and Android.

## Stack

- React Native
- Expo SDK 57
- TypeScript
- React Navigation
- Express backend via `EXPO_PUBLIC_API_URL`

This folder is the mobile app only. It does not contain a second backend.

## Install

```bash
cd my-app
npm install
```

## Environment

Copy `.env.example` to `.env`.

For **Expo web** or the **iOS Simulator** on this Mac:

```
EXPO_PUBLIC_API_URL=http://127.0.0.1:4000
```

The backend default port is **4000**. Start it with `cd backend && npm run dev`.

Restart Expo (`Ctrl+C`, then `npm start` / `npm run web`) after any `.env` change. Expo reads `EXPO_PUBLIC_*` at startup.

A physical iOS or Android device cannot use `localhost` to reach your Mac. `localhost` on the device is the device itself. Use your Mac’s LAN IP (for example `http://192.168.1.20:4000`) when testing on a real phone. The Android emulator typically uses `http://10.0.2.2:4000`.

Do not commit secrets. `.env` is gitignored. Do not leave `YOUR_LAN_IP` in `.env`; that host does not exist.

## Start Expo

```bash
npx expo start
```

or `npm start`.

## iOS

Requires macOS and Xcode.

```bash
npm run ios          # from repo root
cd my-app && npm run ios
```

or `npx expo start --ios` from `my-app/`.

You can also open the project in Expo Go on a physical iPhone.

## Android

Use an Android emulator or a physical Android device. This does not depend on Xcode.

```bash
npx expo start --android
```

## Authentication

Customer login and register talk to the Day 8 Express APIs through `src/api/auth.ts` and `src/api/client.ts`.

| Action | Endpoint |
| --- | --- |
| Register | `POST /api/auth/register` `{ name, email, phone, password }` |
| Login | `POST /api/auth/login` `{ identifier, password }` |
| Session restore | `GET /api/auth/me` with `Authorization: Bearer <accessToken>` |

Successful login/register returns `{ success: true, data: { user, accessToken } }`. The JWT is stored with **Expo SecureStore** (`src/storage/authStorage.ts`). Passwords are never stored.

On launch, `AuthContext` reads the stored token and calls `/api/auth/me`. A token alone is not enough: invalid or expired tokens are removed and Login is shown. Logout deletes the JWT and returns to the auth stack.

## Catalog (Days 12–13)

Home, Categories, search results, and product details read the Day 11 APIs. There is no banner API; Home uses a static promo strip.

| Screen | API |
| --- | --- |
| Home categories + popular products | `GET /api/categories`, `GET /api/products?page=1&limit=10` |
| Search | `GET /api/products?search=` |
| Category products | `GET /api/products?categoryId=` |
| Product details | `GET /api/products/:id` |

Empty catalog: seed demo groceries from the backend (`cd backend && npm run prisma:seed`). Cart is still a later day.

If Home is empty, confirm `EXPO_PUBLIC_API_URL` points at the running API (port **4000**) and that categories/products exist.

## Folder structure

```
my-app/
├── App.tsx
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   ├── storage/
│   ├── theme/
│   ├── types/
│   └── utils/
└── assets/
```

## Cross-platform notes

- Prefer Expo APIs and React Native core components.
- Development can happen on macOS while the same codebase targets Android and iOS.
- iOS Simulator needs Xcode on macOS. Android does not.
