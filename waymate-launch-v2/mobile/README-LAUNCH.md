# WayMate Android launch checklist

## Why the previous build showed a blank/white screen

The previous project could remain on the native splash while Firebase was not initialized or the JS startup path failed. This version: 
- configures an explicit branded splash screen;
- hides the splash only after auth startup completes;
- catches Firebase startup errors and shows a setup screen instead of a blank page;
- supports the Android Firebase `google-services.json` file;
- uses `10.0.2.2` as the default Android emulator API host, not `localhost`;
- allows cleartext HTTP only when `APP_ENV=development`.

## Required Firebase file

Place the real Firebase Android file at `mobile/google-services.json` before a Firebase-enabled EAS build. Do not commit secrets to a public repository.

## Environment

Create `mobile/.env`:

```env
APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3001/api
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
GOOGLE_SERVICES_FILE=./google-services.json
```

Use the LAN IP of the computer running the backend when testing on a physical Android phone. For an Android emulator, `http://10.0.2.2:3001/api` reaches the host machine.

## EAS

```bash
cd mobile
npm install
npx eas login
npx eas project:init
npx eas build:configure
npx eas build --platform android --profile preview
```

For Play Store release:

```bash
npx eas build --platform android --profile production
```

Production must use HTTPS for the API.

## Product scope

React Native is the only customer/driver application. The React web application remains admin-only.

The mobile app supports both Find Ride and Offer Ride in one account, car + bike vehicles, KYC, RC/insurance verification, bookings, live trip location, safety controls, SOS and WayMate support at +91 7259335286.

## Karnataka coverage

The UI includes common Karnataka city/route presets, including Bengaluru, Mysuru, Tumakuru, Kolar, KGF, Bangarapet and other major cities. Actual ride search remains database-driven, so hosts can publish any valid Karnataka origin/destination. A production map/places provider should be enabled for address autocomplete and coordinates.
