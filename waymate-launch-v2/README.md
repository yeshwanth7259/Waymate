# WayMate Launch Build

WayMate is a mobile-first carpool + bikepool platform for Bengaluru and later other cities.

## Product boundary

**React Native mobile app**
- Rider / user experience
- Host / driver experience
- Find Ride
- Offer Ride
- Booking requests and acceptance
- KYC onboarding
- Vehicle RC + insurance verification
- Women Safety Mode
- Emergency contacts and SOS
- Live host + rider location
- Trip lifecycle

**React web admin console**
- User operations
- KYC review
- Vehicle document review
- Ride control
- Live trip monitoring
- Safety reports / SOS
- Safety policy configuration

There is intentionally **no user-facing web dashboard** in this build.

## Why the phone screenshots looked wrong

The old experience was rendering a web-style layout on the phone. That creates desktop navigation, clipped columns and browser/WebView behaviour. The new `mobile/` project is native React Native and does not load the website in a WebView.

The screenshot showing `net::ERR_CLEARTEXT_NOT_PERMITTED` is an Android HTTP security error. For local development, `APP_ENV=development` enables cleartext access so a physical device can reach a local Node server over LAN. Production must use HTTPS.

## End-to-end launch flow

### New user

Phone OTP -> profile details -> gender -> KYC identity + selfie -> KYC review -> verified user.

### Find a ride

Find Ride -> route/date -> live ride results -> host/vehicle/safety details -> request seat -> host accepts -> confirmed booking -> live trip -> complete -> future rating/review.

### Offer a ride

Offer Ride -> route/date -> verified vehicle -> price/seats -> women-safety setting -> publish -> receive requests -> accept -> start trip -> background GPS -> live trip -> complete.

### Driver eligibility

Identity KYC + selfie + driving licence + RC + active insurance must be verified before a ride can be published or started.

### Live tracking

Host and confirmed riders can publish live location during `IN_PROGRESS`. Authorized trip participants and the admin operations console receive real-time updates through Socket.IO. For production scale, move latest location state to Redis and keep sampled history in PostgreSQL.

## Safety policy

The default policy includes women-only rides, verified hosts and vehicles, KYC requirements, emergency contacts, SOS and configurable female-companion rules for larger mixed carpools.

The policy is server-enforced and configurable from the admin console. It should be reviewed for local legal, insurance and privacy requirements before public launch.

## Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Create `backend/.env` from `.env.example`.

## Mobile

This is a native Android build, not a website wrapper.

1. Put the real Firebase Android config at `mobile/google-services.json`.
2. Put your Android Maps API key in `mobile/.env`.
3. Set `EXPO_PUBLIC_API_BASE_URL` to your backend LAN IP for local device testing.
4. Install dependencies and prebuild.

```bash
cd mobile
npm install
npx expo prebuild
npx expo run:android
```

Production:

```bash
npx eas build --platform android --profile production
```

Production API must be HTTPS.

## Admin

```bash
cd admin
npm install
npm run dev
```

The admin application is the only web application.

## Secrets

Never commit Firebase Admin private keys, PostgreSQL passwords, document storage credentials or Maps secrets.
