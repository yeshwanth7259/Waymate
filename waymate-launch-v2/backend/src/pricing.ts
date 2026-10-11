export const PLATFORM_COMMISSION_RATE = 0.12;

export function calculateCommission(grossAmount: number) {
  return Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
}

const pricingRates = {
  CAR: { perKm: 5, perHour: 10, base: 8 },
  BIKE: { perKm: 3, perHour: 8, base: 5 },
} as const;

export function estimateSeatFare(
  vehicleType: keyof typeof pricingRates,
  distanceKm: number,
  durationMinutes: number,
) {
  const rates = pricingRates[vehicleType];
  const raw = rates.base + distanceKm * rates.perKm + (durationMinutes / 60) * rates.perHour;
  const suggested = Math.max(20, Math.round(raw / 5) * 5);

  return {
    suggested,
    minimum: Math.max(20, Math.floor((suggested * 0.75) / 5) * 5),
    maximum: Math.ceil((suggested * 1.5) / 5) * 5,
    currency: 'INR',
    perSeat: true,
    commissionRate: PLATFORM_COMMISSION_RATE,
  };
}
