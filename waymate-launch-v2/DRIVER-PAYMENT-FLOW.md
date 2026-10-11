# WayMate direct-payment and commission flow

## Rider payment

1. A confirmed booking stores the per-seat fare and the number of seats.
2. The rider pays the driver directly in cash or by UPI after the trip is complete.
3. WayMate does not collect the fare, create an online payment order, or initiate a driver payout.
4. The driver records the cash collection against the booking. The server allows this only for that ride's driver, after trip completion, and only once.

## Platform commission

The platform commission is 12% of the amount collected for the booking. On driver confirmation, the backend writes one immutable commission entry per booking. The driver's wallet displays the signed commission liability, weekly gross collection, net fare after commission, and ledger history.

Drivers remit commission outside this app using payment instructions supplied by WayMate. They submit the amount and external transfer reference; the WayMate admin panel verifies or rejects that submission. The application stores the reference and reviewer decision only. It does not accept card/UPI payments or represent a submitted reference as money received.

## Fare guidance

The server's per-seat estimate combines route distance, estimated duration, and vehicle type. Drivers may set a fare within the returned suggested range. Estimates are guidance, not a quote from a live maps or competing ride service. The final fare is shown before the rider requests a seat.

## Launch checks

- Confirm commission calculations and accounting practices with the business and local tax/legal advisers.
- Publish the correct off-app payment instructions and support process to drivers.
- Reconcile verified remittances against the platform's actual bank/UPI statement.
- Treat KYC documents and payment references as restricted operational data and apply retention/access controls.
