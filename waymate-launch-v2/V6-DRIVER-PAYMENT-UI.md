# WayMate V6 - Driver Flow & Payment UI

## Rider flow

Find Ride → Ride Details → Request Seat → Confirmed Booking → Pay Ride Fare → Payment Captured → Trip Active → Live Tracking → Trip Complete

### Rider payment screen
- Total ride fare
- Transparent driver-side commission line
- Driver eligible payout
- Verified driver settlement explanation
- Razorpay checkout remains the real payment action

The rider does not see a fake wallet balance.

## Driver flow

Offer Ride → Vehicle/KYC verification → Publish Ride → Ride Requests → Accept Rider → Paid Booking → Start Trip → Complete Trip → Driver Center → Weekly Payout

### Driver Center
- This week's net earnings
- Gross fares
- WayMate commission
- Pending earnings
- Weekly earnings chart
- Weekly payout cycle
- Next scheduled payout date
- Available settled earnings
- Verified payout account
- Recent payout history

### My Rides > Hosted
A prominent Driver earnings & payouts card opens Driver Center.

### Profile
A dedicated Driver Earnings entry opens Driver Center.

## Money model

Example only:

Rider fare: ₹100
WayMate driver commission: ₹10
Driver eligible payout: ₹90

The actual commission percentage comes from `PLATFORM_FEE_PERCENT` on the backend.

The backend uses Razorpay Route when `RAZORPAY_ROUTE_ENABLED=true` and the host has a verified linked payout account. V6 configures the Route transfer with a weekly settlement hold until the next weekly payout date. Provider webhooks update the payout state.

## Production requirements

- Razorpay Route capability enabled for the merchant account
- Linked-account onboarding and verification
- Production webhook endpoint configured
- Live API credentials
- Refund/reversal rules reviewed
- Reconciliation and payout failure handling
- Legal/compliance review for the marketplace/payment model
