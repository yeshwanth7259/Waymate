# WayMate Firebase SMS OTP setup

WayMate's login flow uses **Firebase Authentication → Phone → SMS verification code**. A user enters a phone number, receives Firebase's six-digit SMS, enters it in WayMate, and Firebase creates/signs in that account. The app then creates or loads the WayMate profile using the verified Firebase ID token.

This is different from the Firebase **Phone Number Verification (PNV)** screen shown in one of the screenshots. PNV verifies the SIM through a supported carrier and **does not send an OTP SMS**. Its OAuth/branding warning is for PNV; it is not a prerequisite for this SMS-code login. Do not switch to PNV for the requested OTP flow.

The error `auth/operation-not-allowed` is a Firebase project configuration error, not a React Native screen error.

## 1. Enable Phone Authentication

Firebase Console → Authentication → Sign-in method → Phone → Enable.

## 2. Allow India SMS

Firebase Console → Authentication → Settings → SMS region policy → allow India (+91).

New Firebase projects can have SMS regions blocked by default, so this step is mandatory for real Indian OTP delivery.

The screenshot currently shows India allowed. Add each additional destination country users should log in from; accepting an international `+country-code` in the app does not override Firebase's SMS region policy or carrier support.

Firebase Authentication real Phone Auth SMS currently requires the **Blaze (pay-as-you-go) plan**. Firebase documents a standard quota of up to 3,000 verification SMS per day, plus per-IP and per-phone anti-abuse limits. Per-message price depends on the destination country. Check Firebase Authentication usage/billing before opening access to the public.

## 3. Register the exact Android app

Android package:

`com.waymate.app`

Download `google-services.json` for that Android app and put it here:

`mobile/google-services.json`

Do not commit the real file to a public repository.

The current Android package in WayMate is `com.waymate.app`; the checked-in local Android Firebase config is registered for that package. After changing the Firebase project or package, replace the config with a download from the matching Firebase Android app.

## 4. Add signing fingerprints

Firebase Console → Project settings → Your apps → Android app.

Add SHA-1 and SHA-256 for every build that will use Phone Auth, including the EAS development/preview/production credentials you actually distribute.

For an EAS project, inspect the Android credentials and add the fingerprints shown by EAS to Firebase.

Do not assume fingerprints copied from a different build are sufficient. A locally signed APK, EAS preview APK, and Play App Signing release can have different signing certificates. Add the fingerprints for the exact APK installed on the test device and each distributed build.

## 5. Rebuild the native app

After changing Firebase Android configuration, a JS refresh is not enough. Rebuild the Android binary:

```bash
cd mobile
npm install
npx expo prebuild --clean
npx eas build --platform android --profile preview
```

Install the newly generated APK on the phone.

Test on a real device with a real Firebase-enabled build, working internet, and a SIM/phone number in an allowed SMS region. Expo Go is not a valid test target for this native Firebase Auth configuration.

## 6. Test safely before live SMS

Firebase supports fictional test phone numbers/codes in Authentication settings. They intentionally do not deliver a real SMS; use them only to test the enter-code/login screens without consuming quota. Never ship a production build with test-only numbers or codes enabled.

## 7. Production checklist

- Phone provider enabled
- India SMS region enabled
- Android package exactly `com.waymate.app`
- SHA-1 and SHA-256 added
- `google-services.json` matches the Firebase Android app
- EAS preview/live build rebuilt after Firebase changes
- Firebase SMS quota/billing configured as required by the Firebase project
- SMS region policy includes every country WayMate intends to serve
- Backend deployed over HTTPS
- `EXPO_PUBLIC_API_BASE_URL=https://.../api`
- Backend `FIREBASE_PROJECT_ID` matches the mobile and web Firebase project
- Backend verifies Firebase ID tokens using a service account or Application Default Credentials (ADC)

## 8. Website Phone Auth

- Register a Firebase Web app in the same Firebase project.
- Add the development and production hostnames to Authentication → Settings → Authorized domains.
- Copy the Web app's public Firebase configuration into `web/.env.local` using `web/.env.example`.
- The website uses Firebase's reCAPTCHA-backed Phone Auth flow. Test on the authorized hostname with a Firebase fictional phone number before relying on paid SMS delivery.
- Firebase web Phone Auth does not support using `localhost` as a hosted auth domain for real SMS. Test a real number on your authorized HTTPS staging/deployed hostname; use fictional numbers or the Auth Emulator for local development.
- The website explicitly uses Firebase's browser-local auth persistence, so a user who completes OTP stays signed in after a reload or browser restart on that browser profile. The Android app separately keeps its Firebase session in the native app. The website browser and Android app have separate secure sessions, so the first login on each requires phone verification; after that, each remembers the user until they sign out or clear app/browser data.
- Keep service-account JSON, private keys, and OmniRoute credentials on the backend only.

## 9. Backend Firebase Admin identity

The backend must verify every Firebase ID token against the same Firebase project used by the Android and web apps. Configure `backend/.env` from `backend/.env.example`:

- Set `FIREBASE_PROJECT_ID` to the exact Firebase project ID.
- On a developer workstation, either set `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from a privately stored service-account JSON, or configure Google Application Default Credentials with `gcloud auth application-default login`.
- In production on Google Cloud, attach a least-privilege service account and use ADC. Do not commit service-account JSON/private keys or paste them into chat.
- Restart the backend after configuration. It now refuses to start without a project ID and verified Admin credentials (or a development Auth Emulator).

The phone-OTP request and verification are handled by Firebase client SDKs; the backend does not generate, log, email, or send OTPs itself. The backend verifies Firebase ID tokens before granting access to WayMate APIs.
