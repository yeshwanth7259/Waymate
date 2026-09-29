# WayMate Mobility Platform

WayMate is a mobile-first carpool + bikepool platform. The user/driver experience is React Native. The only web application is the operations/admin console.

## Architecture

- `mobile/`: React Native + Expo development build for riders and hosts. Android-first launch.
- `admin/`: React web operations console.
- `backend/`: Node.js + Express + Prisma + PostgreSQL + Firebase Admin + Socket.IO.

A single WayMate account can both find rides and offer rides.

## Launch flow

### Rider
Login -> Profile onboarding -> KYC -> Find Ride -> Search -> Ride Details -> Request Seat -> Host accepts -> Booking Confirmed -> Live Trip -> Trip complete.

### Host/driver
Login -> Profile onboarding -> Identity KYC -> Driving Licence -> Vehicle -> RC + Insurance -> Admin verification -> Offer Ride -> Publish -> Receive requests -> Accept -> Start Trip -> Live location -> Complete.

## KYC and verification

Booking requires verified identity KYC under the default launch policy.

Offering a ride requires:

- Identity document verified
- Selfie verified
- Driving licence verified
- Vehicle RC verified
- Vehicle insurance verified and not expired

Documents are private. Configure `DOCUMENT_STORAGE=firebase` and `FIREBASE_STORAGE_BUCKET` for Firebase Storage in production. Local file storage is available for development only.

## Women Safety Mode

WayMate provides a configurable safety policy. The default launch policy includes:

- Women-only rides are restricted to female riders.
- Women-only rides require a verified female host and verified vehicle.
- A female passenger on a mixed carpool with a male host requires either a verified female host or another confirmed female passenger before the host can accept the booking.
- A female passenger on a bike with a male host is blocked by the default policy.
- The policy is configurable from the admin console.

The system does not force a female passenger to become a driver. Safety should be implemented as verified-host/companion rules, user controls, live tracking and emergency workflows rather than making a passenger drive against their preference.

These are product safety controls, not a substitute for local law, emergency services, insurance requirements, or professional legal advice. Before launch, review the final policy with counsel and your insurer.

## Live location

During an `IN_PROGRESS` trip, the host and confirmed riders can publish location. Authorized trip participants and admin operations can receive live updates through Socket.IO.

For launch-scale production, move the latest location state to Redis and keep sampled route history in PostgreSQL.

## Backend setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Set `backend/.env` from `.env.example`.

Required production secrets:

- `DATABASE_URL`
- Firebase Admin credentials
- `FIREBASE_STORAGE_BUCKET`
- `ADMIN_UIDS` or Firebase admin custom claim

Never commit these values.

## Admin

```bash
cd admin
npm install
npm run dev
```

Admin capabilities include:

- Users
- Ride control
- KYC review
- Vehicle document review
- Live host/rider tracking
- Safety reports

## Mobile Android launch

The mobile app uses React Native Firebase Phone Auth and background location, so use a native development/production build rather than plain Expo Go.

```bash
cd mobile
npm install
npx expo prebuild
npx expo run:android
```

For a production Android build:

```bash
npx eas build --platform android --profile production
```

Set `EXPO_PUBLIC_API_BASE_URL` to a backend URL reachable from the device. For local testing use your computer's LAN IP, not `localhost`.

## Firebase mobile setup

Put the real Android Firebase configuration in `mobile/google-services.json`.

Do not place Firebase Admin private keys in the mobile project.

## Storage

For production document uploads:

```env
DOCUMENT_STORAGE=firebase
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

The backend returns short-lived document URLs only to authorized admin users.

## Before public launch

1. Complete legal/privacy/terms review.
2. Configure document retention/deletion rules.
3. Verify insurance and RC requirements with your insurer.
4. Verify KYC identity-provider/legal requirements for the target market.
5. Configure emergency escalation and SOS contacts.
6. Add rate limiting, audit logging, monitoring and backups.
7. Move latest live location to Redis for multi-instance scaling.
8. Test Android background location on real devices and different battery settings.
9. Perform security testing against trip-room and document endpoints.
10. Run an end-to-end pilot with real users before public launch.
