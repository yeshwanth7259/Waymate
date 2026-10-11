# WayMate V4 changes

## Fixed the OTP UX

- OTP errors are now mapped to actionable messages.
- Resend countdown is implemented.
- OTP screen no longer leaves the user guessing what happened.
- Firebase setup checklist explains the exact `operation-not-allowed` issue shown in the supplied screenshots.

## Native payment flow

- Server-side Razorpay Orders.
- Native React Native Razorpay Checkout.
- Server-side HMAC signature verification.
- Payment state persisted in PostgreSQL.
- Booking cannot start a paid trip until payment is captured.
- Refund + Route transfer reversal path for cancelled captured bookings.
- Razorpay webhook endpoint for payment and transfer state updates.

## Driver wallet / payout

- Wallet screen with available and pending earnings.
- Bank/IFSC/beneficiary onboarding UI.
- Only masked bank account number is stored by WayMate.
- Payout profile state machine.
- Admin payout review and linked-account ID attachment.
- Razorpay Route order transfers to verified linked accounts.

## Live trip

- Host and riders publish authenticated GPS updates.
- Background location is attempted; foreground tracking remains usable if Android declines background permission.
- Socket.IO live location updates.
- Active trip map shows participant markers plus pickup/destination markers when coordinates exist.
- Call, chat, share and SOS controls.
- Trip chat persisted in PostgreSQL and broadcast over Socket.IO.
- Location publishing stops when the trip completes/cancels.

## Route UX

- Use current GPS location on Find Ride and Offer Ride.
- Current address is reverse-geocoded on-device.
- Vehicle passenger-seat limit is enforced by backend and reflected in Offer Ride.

## Admin

- Driver payout review screen.
- Settlement ledger.
- Existing KYC, vehicle, ride, live tracking and safety controls retained.

## External-service boundary

The source code cannot create or modify the user's Firebase, EAS, Supabase or Razorpay account settings without their credentials/permissions. Real OTP, Google Maps, database, payment and bank settlement therefore require the account configuration described in `END-TO-END-SETUP.md`.
