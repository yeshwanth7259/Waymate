# WayMate Native Mobile UI

This app is a **native React Native application**. It does not load the WayMate website in a WebView.

The phone screenshots that showed a desktop/web layout and `net::ERR_CLEARTEXT_NOT_PERMITTED` are caused by the old web-style experience being rendered on Android. This build removes that pattern completely.

## UI structure

- Native portrait layout
- WayMate logo in the native header
- Home hero inspired by the supplied WayMate reference
- Find Ride search screen
- Live Ride Results screen
- Ride Details + booking request
- Offer Ride 3-step flow
- My Rides: Booked / Hosted
- KYC / vehicle verification screens
- Safety Centre
- Live trip map with host + rider locations
- Native bottom navigation

## No user-facing website

Users and drivers use this app only. The React web application remains the admin/operations console.

## Android local development

1. Put your Firebase `google-services.json` in this directory.
2. Set `EXPO_PUBLIC_API_BASE_URL` to the computer's LAN IP, for example:
   `http://192.168.1.20:3001/api`
3. Set `APP_ENV=development`.
4. Run:
   `npm install`
   `npx expo prebuild`
   `npx expo run:android`

The development Android build permits HTTP only so a local Node server can be reached. **Do not use HTTP for production.**

## Production

Use an HTTPS API URL and build with `APP_ENV=production`:

`eas build --platform android --profile production`
