# WayMate Mobile UI Specification

The supplied reference images are treated as the design source. The implementation is adapted to a real phone viewport instead of copying the desktop website into a phone.

## Visual system

- Deep navy: `#062C45`
- WayMate green: `#10A95A`
- Soft green: `#EAF8F0`
- Background: `#F7FAF8`
- White cards with 1px soft border
- Large rounded cards
- Strong 900-weight headings
- Compact 10-12px metadata
- Portrait-first spacing

## Main mobile screens

1. Login / OTP
2. Profile onboarding
3. Home
4. Find Ride
5. Ride Results
6. Ride Details / Request Seat
7. Offer Ride - Route
8. Offer Ride - Vehicle
9. Offer Ride - Confirm
10. My Rides - Booked
11. My Rides - Hosted
12. Live Trip
13. Profile
14. KYC
15. Vehicles
16. Safety Centre

## Navigation

Bottom navigation is intentionally limited to five high-value destinations:

- Home
- Find Ride
- Offer Ride
- My Rides
- Profile

This avoids the clipped desktop navigation shown in the supplied phone photo.

## Functional rule

No screen should depend on marketing/mock ride data for a transaction. Search results, booking status, vehicle verification, KYC status and live locations come from the backend.
