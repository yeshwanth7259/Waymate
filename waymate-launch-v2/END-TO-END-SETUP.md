# WayMate launch checklist

The mobile app, public web client, admin console, and Node API use Firebase Authentication for identity and the API for ride operations.

## Required external services

1. Firebase Authentication with Phone sign-in enabled
2. PostgreSQL for the current Prisma-backed API
3. Google Maps Android key for `react-native-maps`
4. Firebase Admin service account for the backend
5. Public HTTPS backend URL for deployed apps
6. An OmniRoute gateway and configured model for AI features

## Firebase OTP

The mobile and web apps use **Firebase Authentication SMS OTP**: Firebase sends a code, the user enters it, then Firebase creates/signs in the account. The Firebase Phone Number Verification branding screen in the screenshot is a separate, SMS-less SIM verification product; its branding warning is not the setup for SMS OTP. Follow [FIREBASE-OTP-SETUP.md](./mobile/FIREBASE-OTP-SETUP.md) for provider, SMS regions, quota/billing, Android signing, website domain, and Admin SDK setup.

The website uses Firebase Phone Auth with reCAPTCHA. Register a Firebase Web app, add the deployed web hostname under Authentication's authorized domains, and copy its web configuration to `web/.env.local`. Never place Firebase Admin credentials in the browser or mobile app. Real verification SMS requires Firebase's pay-as-you-go (Blaze) plan and is subject to country policy, carrier support, quotas, and abuse protection.

## Database

**Production database status:** the shared API uses Prisma and the `waymate_v2` PostgreSQL schema. Its baseline migration has been applied to the configured Supabase project. The existing `public` schema is preserved; the migration copied Firebase-linked user identities and basic profiles into `waymate_v2` without deleting or altering legacy rows. New rides and bookings are created in the shared API schema.

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Keep `schema=waymate_v2` in the PostgreSQL connection URL when running Prisma CLI commands so migrations and Prisma tooling cannot target the legacy `public` schema. The API also forces its runtime Prisma client to use `waymate_v2`. Use `npm run prisma:migrate` to apply checked-in migrations; do not use `prisma db push` against production.

## Backend environment

Copy `backend/.env.example` to `.env` and fill every value.

Set `FIREBASE_PROJECT_ID` to the same project used by the mobile and web apps, then configure Firebase Admin service-account credentials or Google Application Default Credentials. The backend now fails fast if Firebase identity verification is not configured and does not accept unsigned development tokens. For production, set `NODE_ENV=production`, use HTTPS, managed Firebase Admin credentials, and a production PostgreSQL URL. The direct-driver cash model does not use online payment credentials.

The Android app and website must also point to this same backend URL. The API verifies Firebase ID tokens from that project and maps both clients to one user using the Firebase UID. The API uses the database configured in its `DATABASE_URL`; use the same Supabase PostgreSQL connection string there if Supabase is your selected database. A Firebase project or Supabase database cannot be inferred from the source tree, so configure and verify those service-side settings before launch.

## Android

```bash
cd mobile
npm install
npx expo prebuild --clean
npx eas build --platform android --profile preview
```

Install the generated APK on a real Android phone.

Do not test a new Firebase configuration by only refreshing JavaScript. Firebase native configuration changes require a new native build.

## Physical Android device and local API

Find the computer's LAN IPv4 address, then:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3001/api
APP_ENV=development
```

The phone and development computer must be on the same network. Do not use `localhost` on a physical phone.

## Production API

```env
EXPO_PUBLIC_API_BASE_URL=https://api.your-waymate-domain.com/api
APP_ENV=production
```

The V4 app enables Android cleartext HTTP only for development.

### Render deployment

The repository-root `render.yaml` deploys the shared API from `waymate-launch-v2/backend`. After the change is pushed to the branch connected to the Render Blueprint, sync the Blueprint. Because this is an existing Render service, add or verify the following values directly in the service's Environment settings; Render does not sync `sync: false` values from a Blueprint:

- `DATABASE_URL`: the verified Supabase PostgreSQL connection string, with `schema=waymate_v2` added to its query parameters. Confirm it targets the intended project before deploying.
- `FIREBASE_PROJECT_ID`: `waymate-f9de0`.
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`: the Firebase Admin service-account credentials. Enter them only in Render's environment settings; never commit or send them in chat.
- `FIREBASE_STORAGE_BUCKET`: the exact bucket name shown in Firebase Storage. Enable Storage and grant the service account the permissions needed to store KYC documents.
- `ADMIN_UIDS`: optional comma-separated Firebase UIDs for admin access.
- `NODE_ENV=production` and `DOCUMENT_STORAGE=firebase`.

Render builds with `npm install && npx prisma generate && npm run build`, starts with `npm start`, and checks `/api/health`. After deployment, verify the configured Render API's `/api/health` endpoint before pointing the website and Android app at it. The production runtime targets `waymate_v2`; keep the Render `DATABASE_URL` pointed at the approved Supabase project. Do not use `prisma db push` against production.

## Public website

```bash
cd web
Copy-Item .env.example .env.local
# Fill in the Firebase Web app values and API URL in .env.local.
npm install
npm run dev
```

The website uses the shared API for ride search, booking requests, ride offers, driver document uploads, wallet/commission history, and AI support. Its landing page only shows aggregated open-route summaries; the API does not expose user profile or booking data publicly. Admin review and KYC approval remain in the admin console.

Firebase Hosting is configured to serve `web/dist` as a single-page app. After creating `web/.env.local` and building the website:

```powershell
firebase login
firebase use --add
Set-Location web
npm run build
Set-Location ..
firebase deploy --only hosting
```

Add the deployed Hosting domain to Firebase Authentication's authorized domains before testing web Phone Auth.

## OmniRoute AI

The backend calls OmniRoute's OpenAI-compatible chat endpoint. Configure these backend-only environment variables:

```env
OMNIROUTE_BASE_URL=https://your-omniroute-host.example/v1
OMNIROUTE_API_KEY=your-server-side-gateway-key
OMNIROUTE_MODEL=provider/model
```

For local development, OmniRoute's local endpoint can be `http://localhost:20128/v1`. Use HTTPS for a remote gateway. Create the API key in OmniRoute and select a model that is already configured there. Do not put this key in `web/.env.local`, Expo variables, or source control. The route assistant does not have live navigation, traffic, or competitor-pricing data.

## Direct ride payment and platform commission

There is no online checkout or automated bank payout. Riders pay the driver directly in cash or via the driver's UPI after the completed ride. The driver confirms cash collection in the booking flow; the backend then records the 12% WayMate commission due and the driver's net fare.

Drivers pay platform commission outside the app using payment instructions supplied by WayMate, then submit the external transfer reference in Driver Wallet. Admin staff verify or reject that reference in the Platform Fees panel. This app records the ledger and review state but does not initiate or claim to verify a money transfer.

## GPS/live tracking

Use a real signed Android build. Grant foreground location and allow background location when Android presents the permission flow. Start a trip from the host account, then open the same trip from a confirmed rider account. The host and rider should see live markers update.

The admin Live Tracking screen receives the same location events over Socket.IO.

## What cannot be truthfully preconfigured in a source ZIP

- Firebase provider/region settings
- Firebase SHA fingerprints for your actual EAS credentials
- your Firebase `google-services.json`
- the current PostgreSQL connection string and credentials
- Google Maps API key
- OmniRoute endpoint, gateway key, and model
- production HTTPS domain

Those are account credentials and external-service state, not application source code. The backend must be configured with the Firebase Admin identity before the API can start; real SMS tests additionally require the project's Blaze billing/quotas and an authorized test device/domain. The SQL Connect cutover additionally requires Firebase CLI authentication and a reviewed data migration; it is not safe to claim that migration is live until those steps have been completed.
