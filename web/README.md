# Sainik Mart website

Public landing site for [sainikmartapp.in](https://sainikmartapp.in). This package is independent of `backend/`, `admin/`, and `my-app/`.

## Local development

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

From the repo root you can also run `npm run landing`.

The site serves at http://localhost:5174 by default.

## Production build

```bash
cd web
npm run build
```

Output is `web/dist`. Preview locally with `npm run preview`.

Typecheck only:

```bash
npm run typecheck
```

## App installation

All Install buttons read [`src/config/appConfig.ts`](src/config/appConfig.ts).

Set these in `.env` (local) or in the build environment (production):

| Variable | Purpose |
| --- | --- |
| `VITE_APP_DISTRIBUTION_MODE` | `apk`, `playstore`, or `coming_soon` (default) |
| `VITE_ANDROID_APK_URL` | HTTPS URL of a public Android APK |
| `VITE_PLAY_STORE_URL` | Official Google Play listing |
| `VITE_DOWNLOAD_LABEL` | Button label (default `Install App`) |
| `VITE_SITE_URL` | Canonical site URL |
| `VITE_CONTACT_PHONE` | Optional. Leave empty if unknown. |
| `VITE_CONTACT_ADDRESS` | Optional. Leave empty if unknown. |

Do not put API secrets, database URLs, or admin credentials in `VITE_` variables.

### Switch from APK to Play Store

1. Publish the app on Google Play.
2. Set `VITE_APP_DISTRIBUTION_MODE=playstore`.
3. Set `VITE_PLAY_STORE_URL` to the listing URL.
4. Rebuild and redeploy `web/dist`.

Until a real HTTPS APK or Play URL exists, keep `coming_soon`. Do not use an Expo development URL as an APK.

## Deploy on AWS Lightsail / Nginx

The intended public host is `https://sainikmartapp.in`. Leave these hosts unchanged:

- `https://api.sainikmartapp.in`
- `https://admin.sainikmartapp.in`

Suggested steps (run on the server after you decide to go live — this repo does not apply them):

1. Build on your machine: `cd web && npm run build`.
2. Upload `web/dist` to `/var/www/sainik-mart/web/dist` on Lightsail.
3. Add a **new** Nginx server block from [`deploy/nginx-sainikmartapp.in.conf.example`](deploy/nginx-sainikmartapp.in.conf.example). Do not edit the `api.` or `admin.` blocks.
4. Reload Nginx and issue a Let’s Encrypt certificate for the apex domain only.

## What you still need to provide

- A publicly hosted HTTPS APK URL, or a Play Store URL
- Optional phone number and registered address
- Optional official app screenshots or product photography
- Optional live category names if the marketing grid should match production exactly
