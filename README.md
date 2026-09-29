# WayMate Frontend

Production-oriented React/Vite/TypeScript frontend for the WayMate backend through Phase 9 live tracking.

## Product structure

Public website:
- `/` landing page
- `/login` Firebase phone OTP

Authenticated portal:
- `/app` dashboard
- `/app/find` find a ride
- `/app/offer` offer a ride
- `/app/rides` bookings, hosted rides and passenger requests
- `/app/vehicles` vehicle management
- `/app/profile` profile management
- `/app/trips/:id` live trip tracking

## Backend routes used

Authentication:
- POST `/api/auth/sync`

User:
- GET `/api/users/me`
- PUT `/api/users/me`

Vehicles:
- GET `/api/vehicles`
- POST `/api/vehicles`
- PUT `/api/vehicles/:id`
- DELETE `/api/vehicles/:id`

Rides:
- GET `/api/rides/search`
- GET `/api/rides/my`
- GET `/api/rides/:id`
- POST `/api/rides`
- PUT `/api/rides/:id`
- DELETE `/api/rides/:id`

Requests / bookings:
- GET `/api/requests/my`
- POST `/api/rides/:id/request`
- POST `/api/requests/:id/accept`
- POST `/api/requests/:id/reject`
- GET `/api/bookings/my`
- POST `/api/bookings/:id/cancel`

Trips:
- GET `/api/trips/my`
- GET `/api/trips/:id`
- POST `/api/trips/:id/start`
- POST `/api/trips/:id/complete`
- POST `/api/trips/:id/cancel`
- POST `/api/trips/:id/location`

## Environment

Copy `.env.example` to `.env` and set:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Only Firebase Web SDK configuration belongs here. Never put Firebase Admin credentials or database passwords in the frontend.

## Run

```bash
npm install
npm run dev
```

The Vite dev server is configured for port `3000`.

## Phase 9 live tracking

The rider view uses Socket.IO and React-Leaflet. The host trip screen can also publish browser/device GPS while the trip is `IN_PROGRESS`. GPS publishing is throttled to approximately one update every three seconds.

For production mobile tracking, replace browser GPS with React Native/device location and retain the same backend `/api/trips/:id/location` contract.

## Map

Leaflet renders OpenStreetMap tiles in this development implementation. Review the selected tile provider's attribution, usage and scaling policy before production deployment.

## Data policy

The frontend does not seed fake rides, bookings, users, fares, active-driver counts or route metrics. Marketing copy is qualitative and application screens render API data.
